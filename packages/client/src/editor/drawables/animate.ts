import {clamp} from "@vueuse/core";

export function animate(
  time: number,
  startTime: number,
  endTime: number,
  startValue: number,
  endValue: number,
  easingFn?: (x: number) => number,
) {
  const duration = endTime - startTime;
  let progress = clamp((time - startTime) / duration, 0, 1);
  if (easingFn) progress = easingFn(progress);

  return startValue + (endValue - startValue) * progress;
}


export namespace Easing {
  export function outQuad(x: number) {
    return x * (2 - x);
  }
}