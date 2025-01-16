import { Vec2 } from '@osucad/framework';
import { Matrix } from 'pixi.js';
import { PathPoint } from '../hitObjects/PathPoint';
import { PathType } from '../hitObjects/PathType';
import { PathApproximator } from './PathApproximator';

export function pathToBezier(path: PathPoint[]) {
  if (path.length <= 2)
    return path;

  const newPath: PathPoint[] = [];

  let segmentType = path[0].type;
  let segmentStart = 0;

  for (let i = 1; i < path.length; i++) {
    const point = path[i];

    if (point.type !== null || i === path.length - 1) {
      const segmentEnd = i;
      const segment = path.slice(segmentStart, segmentEnd + 1);

      let newSegment: PathPoint[] = segment;

      if (segmentType === PathType.PerfectCurve) {
        newSegment = convertCircularArcToBezier(
          segment.map(it => it.position),
        );
      }

      newPath.push(...(i === path.length - 1 ? newSegment : newSegment.slice(0, -1)));

      segmentStart = i;
      segmentType = point.type;
    }
  }

  return newPath;
}

const circlePresets: CircleBezierPreset[] = [
  {
    maxAngle: 0.4993379862754501,
    points: [
      new Vec2(1, 0),
      new Vec2(1.0, 0.2549893626632736),
      new Vec2(0.8778997558480327, 0.47884446188920726),
    ],
  },
  {
    maxAngle: 1.7579419829169447,
    points: [
      new Vec2(1, 0),
      new Vec2(1.0, 0.6263026),
      new Vec2(0.42931178, 1.0990661),
      new Vec2(-0.18605515, 0.9825393),
    ],
  },
  {
    maxAngle: 3.1385246920140215,
    points: [
      new Vec2(1, 0),
      new Vec2(1.0, 0.87084764),
      new Vec2(0.002304826, 1.5033062),
      new Vec2(-0.9973236, 0.8739115),
      new Vec2(-0.9999953, 0.0030679568),
    ],
  },
  {
    maxAngle: 5.69720464620727,
    points: [
      new Vec2(1, 0),
      new Vec2(1.0, 1.4137783),
      new Vec2(-1.4305235, 2.0779421),
      new Vec2(-2.3410065, -0.94017583),
      new Vec2(0.05132711, -1.7309346),
      new Vec2(0.8331702, -0.5530167),
    ],
  },
  {
    maxAngle: 2 * Math.PI,
    points: [
      new Vec2(1, 0),
      new Vec2(1.0, 1.2447058),
      new Vec2(-0.8526471, 2.118367),
      new Vec2(-2.6211002, 7.854936e-06),
      new Vec2(-0.8526448, -2.118357),
      new Vec2(1.0, -1.2447058),
      new Vec2(1.0, -2.4492937e-16),
    ],
  },
];

interface CircleBezierPreset {
  maxAngle: number;
  points: Vec2[];
}

export function convertCircularArcToBezier(segment: Vec2[]): PathPoint[] {
  if (segment.length !== 3)
    return segment.map((it, index) => new PathPoint(it, index === 0 ? PathType.Bezier : null));
  const cs = PathApproximator._circularArcProperties(segment);
  if (!cs.isValid)
    return segment.map((it, index) => new PathPoint(it, index === 0 ? PathType.Bezier : null));

  let preset = circlePresets[circlePresets.length - 1];

  for (const p of circlePresets) {
    if (p.maxAngle >= cs.thetaRange) {
      preset = p;
      break;
    }
  }

  const arc = preset.points.map(it => it.clone());
  let arcLength = preset.maxAngle;

  const n = arc.length - 1;
  let tf = cs.thetaRange / arcLength;

  while (Math.abs(tf - 1) > 0.0000001) {
    for (let j = 0; j < n; j++) {
      for (let i = n; i > j; i--) {
        arc[i] = arc[i].scale(tf).add(arc[i - 1].scale(1 - tf));
      }
    }

    arcLength = Math.atan2(arc[arc.length - 1].y, arc[arc.length - 1].x);
    if (arcLength < 0) {
      arcLength += 2 * Math.PI;
    }

    tf = cs.thetaRange / arcLength;
  }

  const rotator = new Matrix()
    .scale(cs.radius, cs.radius * cs.direction)
    .rotate(cs.thetaStart)
    .translate(cs.centre.x, cs.centre.y);

  for (let i = 0; i < arc.length; i++) {
    arc[i] = rotator.apply(arc[i]);
  }

  return arc.map((it, index) => new PathPoint(it, index === 0 ? PathType.Bezier : null));
}
