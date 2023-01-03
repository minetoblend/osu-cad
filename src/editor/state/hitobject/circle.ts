import {defineHitObject, HitObject} from "@/editor/state/hitobject";

export const createCircle = defineHitObject('circle', () => {
    return {}
})

export type HitCircle = ReturnType<typeof createCircle>

export function isHitCircle(hitObject: HitObject): hitObject is HitCircle {
    return hitObject.type === 'circle'
}
