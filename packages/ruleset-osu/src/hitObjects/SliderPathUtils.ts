import type { PathPoint } from '@osucad/core';
import type { Slider } from './Slider';
import { PathType } from '@osucad/core';
import { Vec2 } from '@osucad/framework';

export class SliderPathUtils {
  static getSegments(path: readonly PathPoint[]): SliderPathSegment[] {
    const segments: SliderPathSegment[] = [];

    let segmentStart = 0;
    let segmentType = path[0].type ?? PathType.Bezier;

    for (let i = 1; i < path.length; i++) {
      if (path[i].type !== null) {
        segments.push({
          points: path.slice(segmentStart, i),
          segmentStart,
          segmentEnd: i,
          segmentLength: i - segmentStart,
          segmentType,
        });

        segmentStart = i;
        segmentType = path[i].type!;
      }
    }

    if (segmentStart < path.length - 1) {
      segments.push({
        points: path.slice(segmentStart, path.length),
        segmentStart,
        segmentEnd: path.length,
        segmentLength: path.length - segmentStart,
        segmentType,
      });
    }

    return segments;
  }

  static getLastSegment(path: PathPoint[]): SliderPathSegment {
    const segmentStart = path.findLastIndex(point => point.type !== null);
    const segmentType = path[segmentStart].type ?? PathType.Bezier;

    return {
      points: path.slice(segmentStart),
      segmentStart,
      segmentEnd: path.length,
      segmentLength: path.length - segmentStart,
      segmentType,
    };
  }

  static getInsertionPoint(slider: Slider, mousePos: Vec2) {
    if (
      slider.controlPoints.some(
        p => mousePos.sub(slider.stackedPosition).distance(p) < 8,
      )
    ) {
      return { position: null, closest: null };
    }

    let last = slider.path.controlPoints[0];
    let closest: SliderInsertPoint | null = null;
    let closestDistance: number = Infinity;

    for (let i = 1; i < slider.path.controlPoints.length; i++) {
      const current = slider.path.controlPoints[i];

      const A = last;
      const B = current;
      const P = Vec2.sub(mousePos, slider.position);
      const AB = Vec2.sub(B, A);
      const AP = Vec2.sub(P, A);

      const lengthSquaredAB = AB.lengthSq();
      let t = (AP.x * AB.x + AP.y * AB.y) / lengthSquaredAB;
      t = Math.max(0, Math.min(1, t));

      const position = Vec2.add(A, AB.scale(t));

      const distance = position.distance(P);
      if (distance < 100) {
        if (distance < closestDistance) {
          closest = {
            position,
            index: i,
          };
          closestDistance = distance;
        }
      }
      last = current;
    }

    return { position: closest, distance: closestDistance };
  }

  static getNextPathType(
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
        newType = PathType.BSpline;
        break;
      case PathType.BSpline:
        newType = null;
        break;
    }

    if (index === 0 && newType === null) {
      newType = PathType.Bezier;
    }

    return newType;
  }
}

export interface SliderPathSegment {
  points: PathPoint[];
  segmentStart: number;
  segmentEnd: number;
  segmentLength: number;
  segmentType: PathType;
}

export interface SliderInsertPoint {
  position: Vec2;
  index: number;
}
