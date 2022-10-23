import {HitObject, HitObjectOverrides} from "@/editor/hitobject";
import {Slider, SliderOverrides} from "@/editor/hitobject/slider";
import {HitCircle} from "@/editor/hitobject/circle";
import {Vec2} from "@/util/math";
import {SliderControlPoint, SliderPath} from "@/editor/hitobject/sliderPath";
import {EditorContext} from "@/editor";

function flipVec2(v: Vec2, type: 'horizontal' | 'vertical'): Vec2 {
    if (type === "horizontal")
        return new Vec2(512 - v.x, v.y)
    else
        return new Vec2(v.x, 384 - v.y)
}

export function getFlippedHitObject(hitObject: HitObject, type: 'horizontal' | 'vertical') {

    const overrides: Partial<HitObjectOverrides> = {
        position: flipVec2(hitObject.position, type)
    }

    if (hitObject instanceof HitCircle) {
        // do nothing
    }

    if (hitObject instanceof Slider) {
        (overrides as SliderOverrides).controlPoints = hitObject.path.controlPoints.value.map(it =>
            new SliderControlPoint(flipVec2(it.position, type), it.kind)
        )
    }

    return hitObject.serialized(overrides)
}

export function createResnappedPath(controlPoints: SliderControlPoint[], hitObject: HitObject, ctx: EditorContext) {
    const path = new SliderPath()
    path.controlPoints.value = controlPoints
    path.calculatePath(false)

    const length = path.calculatedPath.totalLength

    const overrides = ctx.beatmap.timing.getTimingPointAt(hitObject.time, false)!

    const sv = ctx.beatmap.difficulty.sliderMultiplier.value * (overrides?.sv ?? 1.0)

    const snapSize = 0.25 * 100 * sv

    path.expectedDistance = Math.floor(length / snapSize) * snapSize
    path.setSnakedRange(path.start, path.end, true)
    path.fullPath.value = path.getRange(0, 1)

    return path
}