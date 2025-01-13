import { PathType } from '@osucad/common';

export function getNextControlPointType(
  currentType: PathType | null,
  index: number,
): PathType | null {
  let newType: PathType | null = null;

  switch (currentType) {
    case null:
      newType = PathType.Bezier;
      break;
    case PathType.Bezier:
      newType = PathType.PerfectCurve;
      break;
    case PathType.PerfectCurve:
      newType = PathType.Linear;
      break;
    case PathType.Linear:
      newType = PathType.Catmull;
      break;
    case PathType.Catmull:
      newType = null;
      break;
  }

  if (index === 0 && newType === null) {
    newType = PathType.Bezier;
  }

  return newType;
}
