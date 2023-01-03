import {SoundSample} from "@/editor/audio/soundSample";
import {Ref} from "vue";
import {computedAsync} from "@vueuse/core";


export interface HitSoundSample {
    name: string
    sampleSet: string
    addition: string | null
    color: string
    sampleIndex: null | number

    volume: number
    enabled: boolean

    sample: Ref<SoundSample | undefined>
}

export function createDefaultSamples(): Map<string, HitSoundSample> {

    return new Map<string, HitSoundSample>([
        ['normal-hitnormal', {
            name: 'normal-hitnormal',
            sampleSet: 'normal',
            addition: null,
            sampleIndex: null,
            color: '#ffffff',
            volume: 1,
            enabled: true,
            sample: computedAsync(async () => {
                return await SoundSample.fromURL('/samples/normal-hitnormal.wav')
            })
        }]
    ])
}
