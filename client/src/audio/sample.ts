import {AudioEngine} from "@/audio/engine";

export class Sample {
    source: AudioBufferSourceNode | null = null

    gainNode: GainNode

    constructor(readonly buffer: AudioBuffer, readonly engine: AudioEngine) {
        this.gainNode = engine.context.createGain()
        this.gainNode.connect(engine.context.destination)
    }

    get context() {
        return this.engine.context
    }

    play() {
        this.context.resume()
        const source = this.context.createBufferSource()
        source.buffer = this.buffer

        source.connect(this.gainNode)

        source.start(0, 0)

        source.onended = () => source.disconnect()
    }

    set volume(value: number) {
        this.gainNode.gain.value = value
    }
}