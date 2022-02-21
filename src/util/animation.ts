import {clamp, lerp} from "@/util/math";


export type EasingFunction = (time: number) => number;

export namespace Easing {

  export const outQuint: EasingFunction = time => --time * time * time * time * time + 1

  export const none: EasingFunction = time => time

}

export function animate(time: number, startTime: number, endTime: number, startValue: number, endValue: number, easingFunction: EasingFunction) {
  const t = clamp((time - startTime) / (endTime - startTime), 0, 1)
  return lerp(startValue, endValue, easingFunction(t))
}