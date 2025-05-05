export function almostEquals(a: number, b: number, epsilon = 1e-3): boolean 
{
  return Math.abs(a - b) < epsilon;
}
