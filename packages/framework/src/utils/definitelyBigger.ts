export function definitelyBigger(a: number, b: number, epsilon = Number.EPSILON): boolean {
  return a - b > epsilon;
}
