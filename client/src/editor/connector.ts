import {inject} from "vue";
import {concatMap, filter, firstValueFrom, from, map, Observable, of, Subject} from "rxjs";
import {Client} from "@/networking";
import {ClientCommand, ClientToServerMessage, ServerCommand, ServerToClientMessage} from "osucad-gameserver";

export class EditorConnector {
    #client!: Client<ServerToClientMessage, ClientToServerMessage>

    get client() {
        return this.#client
    }

    async connect(beatmapId: string, token: string) {
        this.#client = new Client(`ws://${window.location.hostname}:7350/edit/${beatmapId}?token=${token}`)

        this.#client.onMessage.subscribe(this.#onMessage)

        await firstValueFrom(this.#client.onConnect)
    }


    readonly #onMatchData = new Subject<MatchEvent>()

    matchEvents(matchId?: string) {
        if (!matchId)
            return this.#onMatchData
        return this.#onMatchData.pipe(
            filter(value => value.matchId === matchId)
        )
    }

    readonly #onMessage = new Subject<ServerToClientMessage>()

    readonly onMessage = this.#onMessage.pipe(concatMap(message => {
        if (message.command.type === 'multiple') {
            return from(message.command.payload)
        }
        else
            return of(message)
    }))

    readonly onAnyCommand =
        this.onMessage.pipe(
            map(message => message.command),
            filter(command => !!command)
        )


    onCommand<T extends ServerCommandType>(opCode: T): Observable<ServerCommandPayload<T>> {
        return this.onAnyCommand
            .pipe(filter(command => command.type === opCode), map(command => command.payload)) as any
    }

    sendMessage(message: ClientToServerMessage) {
        this.client.send(message)
    }

    disconnect() {
        this.client.close()
    }
}

export type ServerCommandType = ServerCommand['type']
export type ServerCommandPayload<T extends ServerCommandType> = NonNullable<Extract<ServerCommand, { type: T }>>['payload']

export type ClientCommandType = ClientCommand['type']
export type ClientCommandPayload<T extends ClientCommandType> = Extract<ClientCommand, { type: T }>['payload']

export interface MatchEvent {
    matchId: string,
    opCode: number,
    payload: any
}

export function useConnector(): EditorConnector {
    return inject('connector') as EditorConnector
}

