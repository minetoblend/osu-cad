import {HitSoundState} from "@/editor/hitsounds/index";
import {UnwrapRef} from "vue";
import {useAudioEngine} from "@/editor/audio/engine";


export function createHitSoundManager(state: UnwrapRef<HitSoundState>) {
    const engine = useAudioEngine()

    const {ctx} = engine

    const scheduledSounds = []

    return {}
}



export type HitSoundManager = ReturnType<typeof createHitSoundManager>
