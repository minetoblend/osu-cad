import {AudioEngine} from "./engine";
import {ref, watch, WatchStopHandle} from "vue";

export class Sound {

    source: AudioBufferSourceNode | null = null
    private readonly destroyWatcher: WatchStopHandle;

    constructor(readonly buffer: AudioBuffer, readonly engine: AudioEngine) {

        this.destroyWatcher = watch(this.playbackRate, value => {
            if (this.isPlaying.value) {
                this.lastTime = this.currentTime
                this.startTime = this.context.currentTime
                this.source!.playbackRate.value = value
            }
        })
    }

    private lastTime = 0
    private startTime = 0
    readonly playbackRate = ref(1)
    readonly isPlaying = ref(false)

    play() {
        this.context.resume()
        this.source = this.context.createBufferSource()
        this.source.buffer = this.buffer
        this.source.connect(this.context.destination)

        this.source.playbackRate.value = this.playbackRate.value

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


    get currentTime() {
        if (!this.isPlaying.value)
            return this.lastTime
        const elapsed = this.context.currentTime - this.startTime

        return this.lastTime + (elapsed * this.playbackRate.value)
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

    destroy() {
        this.stop()
        this.source?.disconnect()
        this.destroyWatcher()
    }

    get duration() {
        return this.buffer.duration
    }
}
