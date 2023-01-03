import {computedEager, MaybeComputedRef, resolveUnref} from "@vueuse/core";
import {computed, unref} from "vue";

export function negative(value: MaybeComputedRef<number>) {
    return computed(() => -resolveUnref(value))
}

export function add(a: MaybeComputedRef<number>, b: MaybeComputedRef<number>) {
    return computed(() => resolveUnref(a) + resolveUnref(b))
}

export function subtract(a: MaybeComputedRef<number>, b: MaybeComputedRef<number>) {
    return computed(() => resolveUnref(a) - resolveUnref(b))
}

export function multiply(a: MaybeComputedRef<number>, b: MaybeComputedRef<number>) {
    return computed(() => resolveUnref(a) * resolveUnref(b))
}

export function divide(a: MaybeComputedRef<number>, b: MaybeComputedRef<number>) {
    return computed(() => resolveUnref(a) / resolveUnref(b))
}

export function ternary(activated: MaybeComputedRef<boolean>, activeValue: MaybeComputedRef<number>, inactiveValue: MaybeComputedRef<number>) {
    return computed(() => resolveUnref(activated) ? resolveUnref(activeValue) : resolveUnref(inactiveValue))
}
