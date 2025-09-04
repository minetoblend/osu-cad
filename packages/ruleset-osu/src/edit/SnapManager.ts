import { PathApproximator, Playfield } from "@osucad/core";
import type { Vec2 } from "@osucad/framework";
import { Bindable, Component, resolved } from "@osucad/framework";
import { PathType, Slider, Spinner, type OsuHitObject } from "../hitObjects";

export class SnapResult
{
  public constructor(
    public readonly position: Vec2,
    public readonly referencePosition: Vec2,
    public readonly distance: number,
  )
  {
  }

  public get offset()
  {
    return this.position.sub(this.referencePosition);
  }
}

type HitObjectQuery =
  | { include: Iterable<OsuHitObject> }
  | { exclude: Iterable<OsuHitObject> };

export type SnapResultQuery = (
  | { hitObjects: Iterable<OsuHitObject> }
  | { points: Iterable<Vec2> }
) & {
  snapTo?: {
    hitObjects?: HitObjectQuery
  }
  maxDistance?: number
  offset?: Vec2
};

export class SnapManager extends Component
{
  public readonly hitObjects = new Bindable(true);

  public readonly sliderAnchors = new Bindable(false);

  public readonly blankets = new Bindable(true);

  public readonly grid = new Bindable(true);

  @resolved(Playfield)
  accessor #playfield!: Playfield

  public *getSnapResults(query: SnapResultQuery)
  {
    let referencePositions = [...this.collectReferenceFeatures(query)];
    const targetPositions = [...this.collectTargetFeatures(query)];

    if (query.offset)
      referencePositions = referencePositions.map(p => p.add(query.offset!));

    const maxDistance = query.maxDistance ?? Number.MAX_VALUE;

    for (const reference of referencePositions)
    {
      for (const target of targetPositions)
      {
        const distance = reference.distance(target);

        if (distance > maxDistance)
          continue;

        yield new SnapResult(target, reference, distance);
      }
    }
  }

  public getClosestSnapResult(query: SnapResultQuery)
  {
    let minDistance = Number.MAX_VALUE;
    let bestResult: SnapResult | undefined;

    for (const result of this.getSnapResults(query))
    {
      if (result.distance < minDistance)
      {
        minDistance = result.distance;
        bestResult = result;
      }
    }

    return bestResult;
  }

  private *collectReferenceFeatures(query: SnapResultQuery)
  {
    if ("points" in query)
    {
      yield* query.points;
      return;
    }

    for (const h of query.hitObjects)
      yield* this.getHitObjectSnapFeatures(h, false);
  }

  private *collectTargetFeatures(query: SnapResultQuery)
  {
    const hitObjects = this.selectHitObjects(query.snapTo?.hitObjects);

    for (const h of hitObjects)
      yield* this.getHitObjectSnapFeatures(h, true);
  }

  private *getHitObjectSnapFeatures(hitObject: OsuHitObject, stacked: boolean)
  {
    if (hitObject instanceof Spinner)
      return;

    const position = stacked ? hitObject.stackedPosition : hitObject.position;

    yield position;

    if (hitObject instanceof Slider)
    {
      yield stacked ? hitObject.stackedPathEndPosition : hitObject.pathEndPosition;

      if (this.sliderAnchors.value)
      {
        for (let i = 1; i < hitObject.path.controlPoints.length; i++)
        {
          yield hitObject.path.controlPoints[i].position.add(position);
        }
      }

      if (this.blankets.value)
      {
        for (const segment of hitObject.path.pathSegments)
        {
          if (segment.type !== PathType.PerfectCurve || segment.pathPoints.length !== 3)
            continue;

          const arc = PathApproximator.getCircularArcProperties(segment.points);

          if (!arc.isValid)
            continue;

          yield arc.centre.add(position);
        }
      }
    }
  }

  private selectHitObjects(query: HitObjectQuery | undefined)
  {
    if (!query)
      return this.visibleObjects;

    if ("include" in query)
      return query.include;

    const exclude = new Set(query.exclude);

    return this.visibleObjects.filter(it => !exclude.has(it));
  }

  private get visibleObjects(): OsuHitObject[]
  {
    return this.#playfield.hitObjectContainer.aliveObjects.map(it => it.hitObject as OsuHitObject);
  }
}
