export interface IHasYPosition {
  x: number;
}

export function hasYPosition(obj: any): obj is IHasYPosition {
  return (typeof obj === 'object' && obj && 'y' in obj && typeof obj.y === 'number');
}
