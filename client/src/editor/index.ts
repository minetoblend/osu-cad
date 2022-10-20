import {Match} from "@heroiclabs/nakama-js";
import {EditorConnector, MatchEvent} from "@/editor/connector";
import {BeatmapState} from "@/editor/state/beatmap";
import {ClientMessages, ClientOpCode} from "@common/opcodes";
import {inject} from "vue";
import {EditorClock} from "@/editor/clock";
import {CommandHandler} from "@/editor/commandHandler";
import {UserState} from "@/editor/state/user";
import {v4 as uuid} from 'uuid'
import {AudioEngine} from "@/audio/engine";
import {apiUrl} from "@/api";
import {Sound} from "@/audio/sound";

import softHitNormal from '@/assets/skin/soft-hitnormal.wav'
import {Sample} from "@/audio/sample";
import axios from "axios";

export class EditorContext {

    constructor(
        readonly connector: EditorConnector,
        readonly beatmapId: string,
    ) {
        this.connector.matchEvents().subscribe(value => this.onMatchEvent(value))
    }

    match?: Match


    readonly clock = new EditorClock()
    readonly audioEngine = new AudioEngine()
    readonly commandHandler = new CommandHandler(this)

    readonly state = {
        beatmap: new BeatmapState(this),
        user: new UserState()
    }

    async connect() {
        await this.loadAudio()

        this.connector.matchEvents().subscribe(event => this.commandHandler.handleMatchEvent(event))
        const match = await this.connector.joinMatchIdForBeatmap(this.beatmapId)

        this.match = match

        setInterval(() => this.sendMessage(ClientOpCode.CurrentTime, {time: this.currentTime}), 200)
    }

    async loadAudio() {
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

    songAudio?: Sound
    hsSample?: Sample

    sendMessage<T extends keyof ClientMessages>(opCode: T, ...params: Parameters<ClientMessages[T]>) {
        //only first parameter gets sent
        const payload = params[0] || {}

        // console.log('send', {opCode, payload})

        return this.connector.sendMatchState(this.match!, opCode, JSON.stringify(payload))
    }

    sendMessageWithResponse<T extends keyof ClientMessages>(opCode: T, ...params: Parameters<ClientMessages[T]>): Promise<MatchEvent> {
        //only first parameter gets sent
        const param = params[0] || {}

        const responseId = uuid();

        (param as any).responseId = responseId

        this.connector.sendMatchState(this.match!, opCode, JSON.stringify(param))

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

    #pendingReplies = new Map<string, { resolve: Function, reject: Function }>()

    get currentTime() {
        return this.clock.time
    }

    onMatchEvent(value: MatchEvent) {
        if (value.payload.responseId) {
            const callbacks = this.#pendingReplies.get(value.payload.responseId)
            if (callbacks) {
                this.#pendingReplies.delete(value.payload.responseId)
                callbacks.resolve(value)
            }
        }
    }
}

export function useContext(): EditorContext {
    return inject('editorContext') as EditorContext
}

export function useState(): BeatmapState {
    return useContext().state.beatmap
}