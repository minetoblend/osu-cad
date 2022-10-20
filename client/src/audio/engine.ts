import {Sound} from "@/audio/sound";
import {Sample} from "@/audio/sample";

export class AudioEngine {
    readonly context = new AudioContext()


    destroy() {
        this.context.close()
    }

    async createSound(buffer: ArrayBuffer): Promise<Sound> {
        const audioBuffer = await this.context.decodeAudioData(buffer)
        return new Sound(audioBuffer, this)
    }

    async createSample(buffer: ArrayBuffer): Promise<Sample> {
        const audioBuffer = await this.context.decodeAudioData(buffer)
        return new Sample(audioBuffer, this)
    }
}

