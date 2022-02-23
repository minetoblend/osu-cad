import {ref, watch} from "vue";

export class AudioEngine {
    readonly context = new AudioContext()


    destroy() {
        this.context.close()
    }

    async createSound(buffer: ArrayBuffer): Promise<Sound> {
        const audioBuffer = await this.context.decodeAudioData(buffer)
        return new Sound(audioBuffer, this)
    }
}

export class Sound {

    source: AudioBufferSourceNode | null = null

    private _channelData: Float32Array | null = null


    constructor(readonly buffer: AudioBuffer, readonly engine: AudioEngine) {

        watch(this.playbackRate, value => {
            if (this.isPlaying.value) {
                this.lastTime = this.currentTime
                this.startTime = this.context.currentTime
                this.source!.playbackRate.value = value
            }
        })
    }

    private lastTime = 0
    private startTime = 0
    readonly playbackRate = ref<number>(1)
    readonly isPlaying = ref<boolean>(false)

    play() {
        this.context.resume()
        this.source = this.context.createBufferSource()
        this.source.buffer = this.buffer
        this.source.connect(this.context.destination)

        this.source.playbackRate.value = this.playbackRate.value

        const offset = this.lastTime

        this.source.start(0, offset)

        this.startTime = this.context.currentTime
        this.isPlaying.value = true // it's the raw value here
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

    get context() {
        return this.engine.context
    }

    get duration() {
        return this.buffer.duration
    }

    seek(time: number) {

        if (time < 0)
            time = 0
        else if (time > this.duration)
            time = this.duration

        if (this.source) {
            this.stop()
            this.lastTime = time
            this.play()
        } else {
            this.lastTime = time
        }

    }

    get channelData() {
        if (!this._channelData)
            this._channelData = this.buffer.getChannelData(0)
        return this._channelData!
    }

    waveform(timePerSample: number = 0.01) {
        const data = this.channelData

        const numSamples = Math.ceil(data.length / this.buffer.sampleRate / timePerSample)
        const values: number[] = new Array(numSamples)
        for (let i = 0; i < numSamples; i++) {
            const time = i * timePerSample;

            const index = Math.floor(time * this.buffer.sampleRate)

            values[i] = Math.abs(data[index])
        }

        for(let i = 0; i < values.length - 1; i++) {
            values[i] = Math.max(values[i], values[i + 1])
        }

        return values
    }
}