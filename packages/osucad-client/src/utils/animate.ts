export function animate(
  time: number,
  startTime: number,
  endTime: number,
  startValue: number,
  endValue: number,
  easingFn?: (x: number) => number,
) {
  const duration = endTime - startTime;
  const timeSinceStart = time - startTime;
  let progress = clamp(timeSinceStart / duration, 0, 1);
  if (easingFn) progress = easingFn(progress);
  return startValue + (endValue - startValue) * progress;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export namespace Easing {
  export function outQuad(x: number) {
    return x * (2 - x);
  }
}