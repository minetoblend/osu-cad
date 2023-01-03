import {TimingPoint} from "@/editor/state/timingPoint";
import {computed, reactive, watchEffect} from "vue";
import {binarySearch, binarySearchCorrected} from "@/util/binarySearch";


export function createTiming() {
    const timingPoints = reactive<TimingPoint[]>([])

    watchEffect(() => timingPoints.sort((a, b) => a.offset - b.offset))

    const uninheritedTimingPoints = computed(() => timingPoints.filter(it => it.timing !== null))
    const inheritedTimingPoints = computed(() => timingPoints.filter(it => it.timing === null))

    const timingPointsWithSv = computed(() => timingPoints.filter(it => it.sliderVelocity !== null))

    function getTimingPointAt(time: number, type?: 'inherited' | 'uninherited' | 'sv') {
        if (type === 'uninherited')
            return binarySearchCorrected(uninheritedTimingPoints.value, t => t.offset, time).value
        if (type === 'inherited')
            return binarySearchCorrected(inheritedTimingPoints.value, t => t.offset, time).value
        if (type === 'sv')
            return binarySearchCorrected(timingPointsWithSv.value, t => t.offset, time).value

        return binarySearchCorrected(timingPoints, t => t.offset, time).value
    }

    function getSvAt(time: number) {
        const baseSv = 1.4

        const timingPoint = getTimingPointAt(time, 'sv')

        let sv = 1.0;

        if (timingPoint.offset <= time) {
            sv = timingPoint.sliderVelocity!
        }

        return baseSv * sv
    }

    return {
        timingPoints,
        uninheritedTimingPoints,
        inheritedTimingPoints,
        getTimingPointAt,
        getSvAt,
    }
}

export type Timing = ReturnType<typeof createTiming>
