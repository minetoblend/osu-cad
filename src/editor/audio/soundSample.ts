import {useAudioEngine} from "@/editor/audio/engine";

export class SoundSample {

    constructor(private readonly buffer: AudioBuffer) {
    }

    static async fromURL(url: string) {
        const data = await (await fetch(url)).arrayBuffer()

        const buffer = await useAudioEngine().ctx.decodeAudioData(data)

        return new SoundSample(buffer)
    }

    play(volume = 1, delay = 0) {
        const {ctx} = useAudioEngine();

        const source = ctx.createBufferSource();
        source.buffer = this.buffer;

        if (volume !== 1) {
            const gain = ctx.createGain();
            gain.gain.value = volume;
            source.connect(gain);
            gain.connect(ctx.destination);
            source.onended = () => {
                source.disconnect()
                gain.disconnect()
            }
        } else {
            source.connect(ctx.destination);
            source.onended = () => {
                source.disconnect()
            }
        }

        if (delay > 0) {
            source.start(ctx.currentTime + delay);
        } else {
            source.start();
        }


        return {
            sample: this,
            source,
            volume,
            time: ctx.currentTime + delay,
            stop: () => {
                source.stop();
                source.disconnect()
            }
        } as ScheduledSample
    }
}

export interface ScheduledSample {
    sample: SoundSample
    source: AudioBufferSourceNode
    volume: number
    time: number

    stop(): void
}
