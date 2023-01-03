import {defineHitObject, HitObject} from "@/editor/state/hitobject";
import {computed, ref} from "vue";
import {sliderPath} from "@/editor/state/hitobject/sliderPath";
import {Vector2} from "osu-classes";
import {Timing} from "@/editor/state/timing";


export const createSlider = defineHitObject('slider', (base) => {
    const controlPoints = ref<ControlPoint[]>([]);
    const velocityOverride = ref<number>();
    const pixelLength = ref(0);
    const snakeIn = computed(() => 0)
    const snakeOut = computed(() => 1)
    const spans = ref(1);

    const path = sliderPath(controlPoints, pixelLength, snakeIn, snakeOut, spans);

    const endPosition = computed(() => spans.value % 2 === 1 ? base.position.value.add(path.endPosition.value) : base.position.value)

    const velocity = ref(1)

    function applyDefaults(timing: Timing) {
        const bpm = timing.getTimingPointAt(base.startTime.value, 'uninherited')?.timing?.bpm ?? 120

        const beatDuration = 60_000 / bpm

        const sv = timing.getSvAt(base.startTime.value)

        velocity.value = (100 * sv) / beatDuration
    }

    const spanDuration = computed(() => pixelLength.value / velocity.value)

    const duration = computed(() => spanDuration.value * spans.value)

    const endTime = computed(() => base.startTime.value + duration.value)

    return {
        controlPoints,
        velocityOverride,
        pixelLength,
        path,
        endPosition,
        duration,
        endTime,
        velocity,
        spans,
        applyDefaults,
    }
})

export type Slider = ReturnType<typeof createSlider>

export interface ControlPoint {
    kind: ControlPointType | null;
    position: Vector2;
}

export const enum ControlPointType {
    Linear,
    Bezier,
    Catmull,
    PerfectCurve
}

export function isSlider(hitObject: HitObject): hitObject is Slider {
    return hitObject.type === 'slider';
}
