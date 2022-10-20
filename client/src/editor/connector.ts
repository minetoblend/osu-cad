import {Client, Match, Session} from "@heroiclabs/nakama-js";
import {inject} from "vue";
import {filter, Subject} from "rxjs";
import {nakamaHostname, nakamaPort} from "@/api";

export class EditorConnector {
    readonly #client = new Client("defaultkey", nakamaHostname(), nakamaPort().toString(), false, 10_000)
    readonly #socket = this.#client.createSocket()
    #session!: Session

    readonly #decoder = new TextDecoder()

    get ownUserId() {
        return this.#session.user_id
    }

    get ownUserName() {
        return this.#session.user_id
    }

    async connect(token: string) {
        this.#session = await this.#client.authenticateCustom(token, true)

        // this.#session = await this.#client.authenticateDevice(deviceId, true, username)
        await this.#socket.connect(this.#session, true)
        //
        this.#setupListeners()
    }

    async listMatches() {
        return this.#client.listMatches(
            this.#session,
        )
    }

    async joinMatchIdForBeatmap(beatmap: string): Promise<Match> {
        const response = await this.#client.rpc(this.#session, 'GetMatchForBeatmap', {beatmap})
        const payload = response.payload as { match?: string } | undefined
        if (payload?.match) {
            return await this.#socket.joinMatch(payload?.match)
        }
        throw new Error("Could not find match")
    }

    readonly #onMatchData = new Subject<MatchEvent>()

    #setupListeners() {
        this.#socket.onmatchdata = matchData => this.#onMatchData.next({
            matchId: matchData.match_id,
            opCode: matchData.op_code,
            payload: JSON.parse(
                this.#decoder.decode(matchData.data)
            )
        })
    }

    matchEvents(matchId?: string) {
        if (!matchId)
            return this.#onMatchData
        return this.#onMatchData.pipe(
            filter(value => value.matchId === matchId)
        )
    }

    sendMatchState(match: Match, opCode: number, payload: string) {
        return this.#socket.sendMatchState(match.match_id, opCode, payload)
    }

    get client() {
        return this.#client
    }

    get socket() {
        return this.#socket
    }

    get session() {
        return this.#session
    }


}

export interface MatchEvent {
    matchId: string,
    opCode: number,
    payload: any
}

export function useConnector(): EditorConnector {
    return inject('connector') as EditorConnector
}

