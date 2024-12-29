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

export function parseAxes(axes: string) {
  if (axes in Axes)
    return Axes[axes as keyof typeof Axes] as Axes;

  throw new Error(`Unknown axes ${axes}`);
}
