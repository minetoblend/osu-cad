export function almostBigger(a: number, b: number, epsilon = 0.001): boolean {
  return a > b - epsilon;
}
