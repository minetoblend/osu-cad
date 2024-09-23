export enum Axes {
  X = 1,
  Y = 2,
  None = 0,
  Both = X | Y,
}

export function axesToString(axes: Axes) {
  switch (axes) {
    case Axes.None:
      return 'None';
    case Axes.X:
      return 'X';
    case Axes.Y:
      return 'Y';
    case Axes.Both:
      return 'Both';
    default:
      throw new Error(`Unknown axes type: ${axes}`);
  }
}
