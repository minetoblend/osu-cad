export interface IHasXPosition {
  x: number;
}

export function hasXPosition(obj: any): obj is IHasXPosition {
  return (typeof obj === 'object' && obj && 'x' in obj && typeof obj.x === 'number');
}
