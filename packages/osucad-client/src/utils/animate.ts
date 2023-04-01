export function animate(
  time: number,
  startTime: number,
  endTime: number,
  startValue: number,
  endValue: number
) {
  const duration = endTime - startTime;
  const timeSinceStart = time - startTime;
  const progress = clamp(timeSinceStart / duration, 0, 1);
  return startValue + (endValue - startValue) * progress;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
