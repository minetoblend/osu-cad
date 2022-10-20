import {clamp, lerp} from "@/util/math";


export function animate(time: number, start: number, end: number, startValue: number, endValue: number, easingFunction?: (x: number) => number) {
    let t = (time - start) / (end - start)
    t = clamp(t, 0, 1)
    if (easingFunction)
        t = easingFunction(t)
    return lerp(startValue, endValue, t)
}