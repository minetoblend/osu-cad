import {Serialized} from 'osucad-gameserver'

export function defaultOverrides(): Serialized.HitObjectOverrides {
    return {
        controlPoints: null,
        newCombo: null,
        time: null,
        repeatCount: null,
        expectedDistance: null,
        position: null,
    }
}