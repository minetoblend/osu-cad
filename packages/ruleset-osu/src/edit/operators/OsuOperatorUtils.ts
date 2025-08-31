import type { Rectangle } from "@osucad/framework";
import { BoundsBuilder, Vec2 } from "@osucad/framework";
import type { SliderPath } from "../../hitObjects";
import { HitCircle, PathPoint, PathType, Slider, Spinner, type OsuHitObject } from "../../hitObjects";
import { OsuPlayfield } from "../../ui";
import { bezierDistanceToProgress, getBezierSlice, getCircularArcSlice, getLinearSlice } from "../tools/slider/pathManipulation";

export namespace OsuOperatorUtils
{
  export function moveIntoBounds(
    hitObjects: readonly OsuHitObject[],
    bounds: Rectangle = OsuPlayfield.BOUNDS,
    includeSliderBodies = false,
  ): boolean
  {
    hitObjects = hitObjects.filter(isMoveable);

    const objectBounds = getBounds(hitObjects, includeSliderBodies);

    if (!objectBounds)
      return false;

    const offset = new Vec2();

    if (objectBounds.left < bounds.left && objectBounds.right < bounds.right)
      offset.x = -objectBounds.left;

    if (objectBounds.left > bounds.left && objectBounds.right > bounds.right)
      offset.x = bounds.right - objectBounds.right;

    if (objectBounds.top < bounds.top && objectBounds.bottom < bounds.bottom)
      offset.y = -objectBounds.top;

    if (objectBounds.top > bounds.top && objectBounds.bottom > bounds.bottom)
      offset.y = bounds.bottom - objectBounds.bottom;

    if (offset.isZero)
      return false;

    for (const h of hitObjects)
      h.moveBy(offset.x, offset.y);

    return true;
  }

  export function restrictMovement(hitObjects: readonly OsuHitObject[], delta: Vec2, includeSliderBodies = false)
  {
    const bounds = getBounds(hitObjects, includeSliderBodies);
    if (!bounds)
      return delta;

    bounds.x += delta.x;
    bounds.y += delta.y;

    const offset = new Vec2();

    if (bounds.left < 0 && bounds.right < OsuPlayfield.BOUNDS.right)
      offset.x = -bounds.left;

    if (bounds.left > 0 && bounds.right > OsuPlayfield.BOUNDS.right)
      offset.x = OsuPlayfield.BOUNDS.right - bounds.right;

    if (bounds.top < 0 && bounds.bottom < OsuPlayfield.BOUNDS.bottom)
      offset.y = -bounds.top;

    if (bounds.top > 0 && bounds.bottom > OsuPlayfield.BOUNDS.bottom)
      offset.y = OsuPlayfield.BOUNDS.bottom - bounds.bottom;

    if (offset.isZero)
      return delta;

    return delta.add(offset);
  }

  export function isMoveable(hitObject: OsuHitObject)
  {
    return hitObject instanceof HitCircle || hitObject instanceof Slider;
  }

  export function* getPositions(hitObjecs: Iterable<OsuHitObject>)
  {
    for (const h of hitObjecs)
    {
      if (h instanceof Spinner)
        continue;

      yield h.position;

      if (h instanceof Slider)
        yield h.pathEndPosition;
    }
  }

  export function getBounds(hitObjects: Iterable<OsuHitObject>, includeSliderBodies = false)
  {
    const bounds = new BoundsBuilder();

    for (const h of hitObjects)
    {
      if (h instanceof Spinner)
        continue;

      bounds.addPoint(h.position);

      if (h instanceof Slider)
      {
        bounds.addPoint(h.pathEndPosition);

        if (includeSliderBodies)
          bounds.addRect(h.path.bounds.withOffset(h.x, h.y));
      }
    }

    return bounds.rect();
  }

  export function getSliderPathSlice(
    path: SliderPath,
    distance: number = path.distance,
  )
  {
    distance = Math.min(distance, path.calculatedDistance);

    if (distance === path.calculatedDistance)
      return path.controlPoints;

    const controlPoints: PathPoint[] = [];

    let currentDistance = 0;

    for (const segment of path.pathSegments)
    {
      if (currentDistance + segment.distance <= distance)
      {
        controlPoints.push(...segment.pathPoints.slice(0, -1));
        currentDistance += segment.distance;
        continue;
      }

      const remainingDistance = distance - currentDistance;

      const progress = remainingDistance / segment.distance;

      const segmentType = segment.points.length <= 2 ? PathType.Linear : segment.type;

      switch(segmentType)
      {
      case PathType.Linear:
        return [
          ...controlPoints,
          ...getLinearSlice(segment.points, progress).map((p, i) => new PathPoint(p, i === 0 ? segment.type : null)),
        ];
      case PathType.Bezier:
        return [
          ...controlPoints,
          ...getBezierSlice(segment.points, bezierDistanceToProgress(segment.points, progress * segment.distance)).map((p, i) => new PathPoint(p, i === 0 ? PathType.Bezier : null)),
        ];
      case PathType.PerfectCurve:
        return [
          ...controlPoints,
          ...getCircularArcSlice(segment.points, progress).map((p, i) => new PathPoint(p, i === 0 ? PathType.PerfectCurve : null)),
        ];
      }
    }

    return controlPoints;
  }
}
