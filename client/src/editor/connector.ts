import {inject} from "vue";
import {concatMap, filter, firstValueFrom, map, Observable, of, Subject} from "rxjs";
import {ClientToServerMessage, ServerToClientMessage} from "protocol/commands";
import {Client} from "@/networking";

export class EditorConnector {
    #client!: Client<ServerToClientMessage, ClientToServerMessage>

    get client() {
        return this.#client
    }

    async connect(beatmapId: string, token: string) {
        this.#client = new Client(ServerToClientMessage, ClientToServerMessage, `ws://${window.location.hostname}:7350/edit/${beatmapId}?token=${token}`)

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
        if (message.serverCommand?.$case === 'multiple')
            return of(...message.serverCommand.multiple.messages)
        else
            return of(message)
    }))

    get onAnyCommand(): Observable<NonNullable<ServerToClientMessage['serverCommand']>> {
        return this.onMessage
            .pipe(map(message => message.serverCommand), filter(command => !!command)) as any
    }

    onCommand<T extends NonNullable<ServerToClientMessage['serverCommand']>['$case']>(opCode: T):
    //@ts-ignore
        Observable<Extract<NonNullable<ServerToClientMessage['serverCommand']>, { $case: T }>[T]> {
        return this.onAnyCommand.pipe(filter(command => command.$case === opCode), map(command => command[opCode as keyof typeof command])) as any
    }

    sendMessage(message: ClientToServerMessage) {
        this.client.send(message)
    }

    disconnect() {
        this.client.close()
    }
}

export type ClientCommandType = NonNullable<ClientToServerMessage['clientCommand']>['$case']
//@ts-ignore somehow this works despite there being an error without the ts-ignore
export type ClientCommandPayload<T extends ClientCommandType> = NonNullable<Extract<NonNullable<ClientToServerMessage['clientCommand']>, { $case: T }>>[T]

export interface MatchEvent {
    matchId: string,
    opCode: number,
    payload: any
}

export function useConnector(): EditorConnector {
    return inject('connector') as EditorConnector
}

