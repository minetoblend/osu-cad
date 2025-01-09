import type { PathPoint } from './PathPoint';
import { PathType } from './PathType';

export class SliderPathUtils {
  static getSegments(path: PathPoint[]): SliderPathSegment[] {
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
}

export interface SliderPathSegment {
  points: PathPoint[];
  segmentStart: number;
  segmentEnd: number;
  segmentLength: number;
  segmentType: PathType;
}
