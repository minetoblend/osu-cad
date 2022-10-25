import {Match} from "@heroiclabs/nakama-js";
import {ClientCommandPayload, ClientCommandType, EditorConnector} from "@/editor/connector";
import {BeatmapState} from "@/editor/state/beatmap";
import {inject} from "vue";
import {EditorClock} from "@/editor/clock";
import {UserState} from "@/editor/state/user";
import {v4 as uuid} from 'uuid'
import {AudioEngine} from "@/audio/engine";
import {apiUrl} from "@/api";
import {Sound} from "@/audio/sound";

import softHitNormal from '@/assets/skin/soft-hitnormal.wav'
import {Sample} from "@/audio/sample";
import axios from "axios";
import {ClientToServerMessage} from "osucad-gameserver";
import {firstValueFrom, interval, Observable, Subject} from "rxjs";

export class EditorContext {

    match?: Match
    readonly clock = new EditorClock()
    readonly audioEngine = new AudioEngine()
    readonly users: UserState
    readonly beatmap: BeatmapState
    readonly clientTickInterval = interval(200)

    songAudio?: Sound
    hsSample?: Sample
    #pendingReplies = new Map<string, { resolve: Function, reject: Function }>()

    constructor(
        readonly connector: EditorConnector,
        readonly beatmapId: string,
    ) {
        // this.connector.matchEvents().subscribe(value => this.onMatchEvent(value))
        this.users = new UserState(this)
        this.beatmap = new BeatmapState(this)
        this.connector.onMessage.subscribe(message => {
            if (message.responseId) {
                const callbacks = this.#pendingReplies.get(message.responseId)
                if (callbacks) {
                    this.#pendingReplies.delete(message.responseId)
                    callbacks.resolve(message.command.payload)
                }
            }
        })
    }

    get currentTime() {
        return this.clock.time
    }

    loadWithProgress(beatmapId: string, token: string): Observable<number> {
        const progress$ = new Subject<number>()

        this.load(beatmapId, token, progress$).then(() => {
            progress$.complete()
            console.log('loaded')
        }).catch(e => console.log(e))

        return progress$
    }

    async load(beatmapId: string, token: string, progress$: Subject<number>) {
        firstValueFrom(this.connector.onCommand('state')).then(console.log)

        await this.connector.connect(beatmapId, token)

        progress$.next(0.2)

        await firstValueFrom(this.connector.onCommand('state'))

        progress$.next(0.5)


        await this.loadAudio(progress$)

        progress$.next(0.75)


        setInterval(() => this.sendMessage('currentTime', this.currentTime), 200)
    }

    async loadAudio(progress$: Subject<number>) {
        const response = await axios.get(apiUrl(`/beatmap/${this.beatmapId}/audio`), {
            responseType: "arraybuffer", withCredentials: true
        })
        if (response.status < 300) {
            const buffer = await response.data
            const sound = await this.audioEngine.createSound(buffer)
            if (sound) {
                this.songAudio = sound
                this.clock.sound = sound
            }

        } else throw Error('Could not load audio')
        progress$.next(0.6)

        const hsResponse = await axios.get(softHitNormal, {
            responseType: "arraybuffer", withCredentials: true
        })
        if (hsResponse.status < 300) {
            const buffer = await hsResponse.data
            const sound = await this.audioEngine.createSample(buffer)
            if (sound) {
                this.hsSample = sound
                sound.volume = 0.25
            }

        }

    }

    sendMessage<T extends ClientCommandType>(opCode: T, payload: ClientCommandPayload<T>) {
        this.connector.sendMessage({
            responseId: null,
            command: {
                type: opCode,
                payload: payload
            }
        } as ClientToServerMessage)
    }

    sendMessageWithResponse<T extends ClientCommandType>(opCode: T, payload: ClientCommandPayload<T>) {

        const responseId = uuid();

        this.connector.sendMessage({
            responseId,
            command: {
                type: opCode,
                payload: payload
            }
        } as ClientToServerMessage)

        setTimeout(() => {
            const callbacks = this.#pendingReplies.get(responseId)
            if (callbacks) {
                this.#pendingReplies.delete(responseId)
                callbacks.reject()
            }
        }, 5000)

        return new Promise((resolve, reject) => {
            this.#pendingReplies.set(responseId, {resolve, reject})
        })
    }

    destroy() {
        this.connector.disconnect()
    }
}

export function useContext(): EditorContext {
    return inject('editorContext') as EditorContext
}

export function useState(): BeatmapState {
    return useContext().beatmap
}