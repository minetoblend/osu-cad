import { Action } from "@osucad/framework";
import type { DDSAttributes, DDSRef, IDecoder, IEncoder } from "@osucad/multiplayer-core";
import { DDS, Delta } from "@osucad/multiplayer-core";
import { nn } from "../../utils";
import { ControlPoint } from "./ControlPoint";
import { ControlPointList } from "./ControlPointList";
import { SampleControlPoint } from "./SampleControlPoint";
import { TimingControlPoint } from "./TimingControlPoint";

enum OpType
{
  Add,
  Remove,
}

type IAddControlPointDelta = [opType: OpType.Add, ref: DDSRef];
type IRemoveControlPointDelta = [opType: OpType.Remove, ref: DDSRef];

class AddControlPointDelta extends Delta<IAddControlPointDelta>
{
  public constructor(
    public readonly ref: DDSRef,
    public readonly controlPoint: ControlPoint,
  )
  {
    super();
  }

  public encode(): IAddControlPointDelta
  {
    return [OpType.Add, this.ref];
  }
}

class RemoveControlPointDelta extends Delta<IRemoveControlPointDelta>
{
  public constructor(public readonly ref: DDSRef)
  {
    super();
  }

  public encode(): IRemoveControlPointDelta
  {
    return [OpType.Remove, this.ref];
  }
}

export type IControlPointInfoDelta = IAddControlPointDelta | IRemoveControlPointDelta;

export type IControlPointInfoSummary = DDSRef[];

export class ControlPointInfo extends DDS<IControlPointInfoDelta>
{
  public static readonly attributes: DDSAttributes = {
    type: "@osucad/control-point-info",
    version: 0,
  };

  public constructor()
  {
    super(ControlPointInfo.attributes);

    this.timingPoints = this.#listFor(TimingControlPoint);
    this.samplePoints = this.#listFor(SampleControlPoint);
  }

  public readonly added = new Action<ControlPoint>();
  public readonly removed = new Action<ControlPoint>();

  readonly #controlPoints: ControlPoint[] = [];
  readonly #idMap = new Map<number, ControlPoint>();

  public readonly timingPoints: ControlPointList<TimingControlPoint>;
  public readonly samplePoints: ControlPointList<SampleControlPoint>;

  public get allControlPoints()
  {
    return this.#controlPoints;
  }

  public timingPointAt(time: number)
  {
    return ControlPointInfo.binarySearchWithFallback(this.timingPoints.items, time, this.timingPoints.first ?? TimingControlPoint.Default);
  }

  public timingPointAfter(time: number)
  {
    let index = ControlPointInfo.binarySearch(this.timingPoints.items, time, ControlPointInfo.EqualitySelection.Rightmost);
    index = index < 0 ? ~index : index + 1;
    return index < this.timingPoints.length ? this.timingPoints.items[index] : null;
  }

  public samplePointAt(time: number)
  {
    const timingPoint = this.samplePoints.controlPointAt(time);

    return timingPoint ?? SampleControlPoint.Default;
  }

  public controlPointAt<T extends ControlPoint>(type: new (...args: any[]) => T, time: number): T | undefined
  {
    const list = this.#listFor(type, false);

    if (list)
      return ControlPointInfo.controlPointAt(list.items, time);

    return undefined;
  }

  public snap(time: number, divisor: number): number
  {
    const timingPoint = this.timingPointAt(time);

    if (!timingPoint)
      return time;

    const beatSnapLength = timingPoint.beatLength / divisor;
    const beats = (Math.max(time, 0) - timingPoint.time) / beatSnapLength;

    const closestBeat = beats < 0 ? -Math.round(-beats) : Math.round(beats);
    const snappedTime = timingPoint.time + closestBeat * beatSnapLength;

    if (this.timingPointAt(snappedTime) !== timingPoint)
      return this.snap(snappedTime, divisor);

    if (snappedTime >= 0)
      return snappedTime;

    return snappedTime + beatSnapLength;
  }

  public add(controlPoint: ControlPoint, skipIfRedundant = false)
  {
    if (skipIfRedundant)
    {
      const list = this.#listFor(controlPoint);
      const existing = list.controlPointAt(controlPoint.time);
      if (existing && controlPoint.isRedundant(existing))
        return false;

      // if (existing && existing.time === controlPoint.time)
      //   this.remove(existing);
    }

    if (!this.#add(controlPoint))
      return false;

    if (this.isAttached())
    {
      const ref = this.encoder.encodeDDS(controlPoint);

      const delta = new AddControlPointDelta(ref, controlPoint);
      const undo = new RemoveControlPointDelta(ref);

      this.submitDelta(delta, undo);
    }

    return true;
  }

  public remove(controlPoint: ControlPoint)
  {
    if (!this.#remove(controlPoint))
      return false;

    if (this.isAttached())
    {
      const ref = this.encoder.encodeDDS(controlPoint);

      const delta = new RemoveControlPointDelta(ref);
      const undo = new AddControlPointDelta(ref, controlPoint);

      this.submitDelta(delta, undo);
    }

    return true;
  }

  #add(controlPoint: ControlPoint)
  {
    const id = controlPoint.uid;

    if (this.#idMap.has(id))
      return false;

    this.#idMap.set(id, controlPoint);
    this.#controlPoints.push(controlPoint);

    this.#listFor(controlPoint).add(controlPoint);

    this.added.emit(controlPoint);

    return true;
  }

  #remove(controlPoint: ControlPoint)
  {
    const id = controlPoint.uid;

    if (!this.#idMap.has(id))
      return false;

    this.#idMap.delete(id);

    const index = this.#controlPoints.indexOf(controlPoint);
    if (index >= 0)
      this.#controlPoints.splice(index, 1);

    this.#listFor(controlPoint).remove(controlPoint);

    this.removed.emit(controlPoint);

    return true;
  }

  #controlPointLists = new Map<any, ControlPointList<ControlPoint>>();

  #listFor<T extends ControlPoint>(controlPoint: T | (new () => T), create?: true): ControlPointList<T>;
  #listFor<T extends ControlPoint>(controlPoint: T | (new () => T), create: false): ControlPointList<T> | undefined;
  #listFor<T extends ControlPoint>(controlPoint: T | (new () => T), create = true): ControlPointList<T> | undefined
  {
    const key = controlPoint instanceof ControlPoint ? controlPoint.constructor : controlPoint;

    let list = this.#controlPointLists.get(key);
    if (!list)
    {
      if (!create)
        return undefined;

      this.#controlPointLists.set(key, list = new ControlPointList());
    }

    return list as unknown as ControlPointList<T>;
  }

  protected override process([opType, ref]: IControlPointInfoDelta, local: boolean): void
  {
    if (local)
      return;

    if (opType === OpType.Add)
    {
      const object = nn(this.decoder.decodeDDS(ref));
      if (!(object instanceof ControlPoint))
        throw new Error("Not a control point");

      this.#add(object);
    }
    else if (opType === OpType.Remove)
    {
      const object = this.decoder.decodeDDS(ref);

      if (object instanceof ControlPoint)
        this.#remove(object);
    }
  }

  protected override replay(delta: Delta): void
  {
    if (delta instanceof AddControlPointDelta)
    {
      this.add(delta.controlPoint);
    }
    else if (delta instanceof RemoveControlPointDelta)
    {
      const object = this.decoder.decodeDDS(delta.ref);
      if (object instanceof ControlPoint)
        this.remove(object);
    }
  }

  public override createSummary(encoder: IEncoder): IControlPointInfoSummary
  {
    return this.#controlPoints.map(it => encoder.encodeDDS(it));
  }

  public override load(summary: unknown, version: number, decoder: IDecoder): void
  {
    for (const ref of (summary as IControlPointInfoSummary))
    {
      const object = nn(decoder.decodeDDS(ref));

      if (!(object instanceof ControlPoint))
        throw new Error("Not a control point");

      this.#add(object);
    }
  }
}

export namespace ControlPointInfo
{

  export enum EqualitySelection
{
  FirstFound,
  Leftmost,
  Rightmost,
}

  export function controlPointAt<T extends ControlPoint>(list: readonly T[], time: number, equalitySelection: EqualitySelection = EqualitySelection.Rightmost)
  {
    let index = binarySearch(list, time, equalitySelection);
    if (index < 0)
      index = ~index - 1;

    return index >= 0 ? list[index] : undefined;
  }

  export function binarySearchWithFallback<T extends ControlPoint>(list: readonly T[], time: number, fallback: T)
  {
    return controlPointAt(list, time) ?? fallback;
  }

  export function binarySearch<T extends ControlPoint>(list: readonly T[], time: number, equalitySelection: EqualitySelection)
  {
    const n = list.length;

    if (n === 0)
      return -1;

    if (time < list[0].time)
      return -1;

    if (time > list[list.length - 1].time)
      return ~n;

    let l = 0;
    let r = n - 1;
    let equalityFound = false;

    while (l <= r)
    {
      const pivot = l + ((r - l) >> 1);

      if (list[pivot].time < time)
        l = pivot + 1;
      else if (list[pivot].time > time)
        r = pivot - 1;
      else
      {
        equalityFound = true;

        switch (equalitySelection)
        {
        case EqualitySelection.Leftmost:
          r = pivot - 1;
          break;

        case EqualitySelection.Rightmost:
          l = pivot + 1;
          break;

        default:
        case EqualitySelection.FirstFound:
          return pivot;
        }
      }
    }

    if (!equalityFound)
      return ~l;

    switch (equalitySelection)
    {
    case EqualitySelection.Leftmost:
      return l;

    default:
    case EqualitySelection.Rightmost:
      return l - 1;
    }
  }
}
