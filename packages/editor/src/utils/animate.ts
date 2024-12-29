export function animate(
  time: number,
  start: number,
  end: number,
  startValue: number,
  endValue: number,
  easing?: (t: number) => number,
) {
  let t = (time - start) / (end - start);
  t = Math.min(Math.max(t, 0), 1);

  if (easing) {
    t = easing(t);
  }

  return startValue + (endValue - startValue) * t;
}
