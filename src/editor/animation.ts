import {computed, ComputedRef, ref} from "vue";
import {negative} from "@/util/reactiveMath";
import {MaybeComputedRef, resolveUnref} from "@vueuse/core";

export const PREEMPT_MIN = 400

function difficultyRange(diff: MaybeComputedRef<number>, min: number, mid: number, max: number): ComputedRef<number> {
    return computed(() => {
        const d = resolveUnref(diff)

        if (d > 5) {
            return mid + ((max - mid) * (d - 5)) / 5;
        }

        if (d < 5) {
            return mid - ((mid - min) * (5 - d)) / 5;
        }

        return mid;
    })
}

export function useAnimationValues() {

    const approachRate = ref(9);

    const preemt = difficultyRange(approachRate, 1800, 1200, 450)
    const fadeIn = computed(() => 400 * Math.min(1, resolveUnref(preemt) / PREEMPT_MIN))

    return {
        fadeIn,
        preemt,
        fadeInNegative: negative(fadeIn),
        preemtNegative: negative(preemt),
    }
}
