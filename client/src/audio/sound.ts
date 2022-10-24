import {AudioEngine} from "./engine";
import {ref} from "vue";

export class Sound {

    source: AudioBufferSourceNode | null = null
    // readonly playbackRate = ref(1)
    readonly isPlaying = ref(false)
    private lastTime = 0
    private startTime = 0
    #playbackRate = ref(1)

    constructor(readonly buffer: AudioBuffer, readonly engine: AudioEngine) {
    }

    get playbackRate() {
        return this.#playbackRate.value
    }

    set playbackRate(value) {
        if (this.isPlaying) {
            this.pause()
            this.#playbackRate.value = value
            this.play()
        } else {
            this.#playbackRate.value = value
        }
    }

    get currentTime() {
        if (!this.isPlaying.value)
            return this.lastTime
        const elapsed = this.context.currentTime - this.startTime

        return this.lastTime + (elapsed * this.playbackRate)
    }

    set currentTime(value: number) {
        if (this.isPlaying.value) {
            this.stop()
            this.lastTime = value
            this.play()
        } else {
            this.lastTime = value
        }
    }

    get context() {
        return this.engine.context
    }

    get duration() {
        return this.buffer.duration
    }

    play() {
        this.context.resume()
        this.source = this.context.createBufferSource()
        this.source.buffer = this.buffer
        this.source.connect(this.context.destination)

        this.source.playbackRate.value = this.playbackRate

        const offset = this.lastTime

        this.source.start(0, offset)

        this.startTime = this.context.currentTime
        this.isPlaying.value = true
    }

    stop() {
        if (this.source) {
            this.lastTime = 0
            this.source.stop(0)
            this.source.disconnect()
            this.source = null
        }
        this.isPlaying.value = false
    }

    pause() {
        const time = this.currentTime
        this.stop()
        this.lastTime = time
    }

    destroy() {
        this.stop()
        this.source?.disconnect()
    }
}
