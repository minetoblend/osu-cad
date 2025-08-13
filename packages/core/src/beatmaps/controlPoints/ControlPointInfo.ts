import type { DDSAttributes, DDSRef, IDecoder, IEncoder } from "@osucad/multiplayer-core";
import { DDS, Delta } from "@osucad/multiplayer-core";
import { nn } from "../../utils";
import { ControlPoint } from "./ControlPoint";
import { Action } from "@osucad/framework";
import { ControlPointList } from "./ControlPointList";
import { TimingControlPoint } from "./TimingControlPoint";
import { SampleControlPoint } from "./SampleControlPoint";

enum OpType
{
  Add,
  Remove,
}

type IAddControlPointDelta = [opType: OpType.Add, ref: DDSRef];
type IRemoveControlPointDelta = [opType: OpType.Remove, ref: DDSRef];

class AddControlPointDelta extends Delta<IAddControlPointDelta>
{
  constructor(
    readonly ref: DDSRef,
    readonly controlPoint: ControlPoint,
  )
  {
    super();
  }

  encode(): IAddControlPointDelta
  {
    return [OpType.Add, this.ref];
  }
}

class RemoveControlPointDelta extends Delta<IRemoveControlPointDelta>
{
  constructor(readonly ref: DDSRef)
  {
    super();
  }

  encode(): IRemoveControlPointDelta
  {
    return [OpType.Remove, this.ref];
  }
}

export type IControlPointInfoDelta = IAddControlPointDelta | IRemoveControlPointDelta;

export type IControlPointInfoSummary = DDSRef[];

export class ControlPointInfo extends DDS<IControlPointInfoDelta>
{
  static readonly attributes: DDSAttributes = {
    type: "@osucad/control-point-info",
    version: 0,
  };

  constructor()
  {
    super(ControlPointInfo.attributes);

    this.timingPoints = this.#listFor(TimingControlPoint);
    this.samplePoints = this.#listFor(SampleControlPoint);
  }

  readonly added = new Action<ControlPoint>();
  readonly removed = new Action<ControlPoint>();

  readonly #controlPoints: ControlPoint[] = [];
  readonly #idMap = new Map<string, ControlPoint>();

  readonly timingPoints: ControlPointList<TimingControlPoint>;
  readonly samplePoints: ControlPointList<SampleControlPoint>;

  timingPointAt(time: number)
  {
    const timingPoint = this.timingPoints.controlPointAt(time);

    return timingPoint ?? TimingControlPoint.Default;
  }

  samplePointAt(time: number)
  {
    const timingPoint = this.samplePoints.controlPointAt(time);

    return timingPoint ?? SampleControlPoint.Default;
  }

  controlPointAt<T extends ControlPoint>(type: new () => T, time: number): T | undefined
  {
    return this.#listFor(type, false)?.controlPointAt(time);
  }

  add(controlPoint: ControlPoint)
  {
    const ref = this.encoder.encodeDDS(controlPoint);

    if (!this.#add(controlPoint))
      return false;

    const delta = new AddControlPointDelta(ref, controlPoint);
    const undo = new RemoveControlPointDelta(ref);

    this.submitDelta(delta, undo);

    return true;
  }

  remove(controlPoint: ControlPoint)
  {
    const ref = this.encoder.encodeDDS(controlPoint);

    if (!this.#remove(controlPoint))
      return false;

    const delta = new RemoveControlPointDelta(ref);
    const undo = new AddControlPointDelta(ref, controlPoint);

    this.submitDelta(delta, undo);

    return true;
  }

  #add(controlPoint: ControlPoint)
  {
    const id = nn(controlPoint.id);

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
    const id = nn(controlPoint.id);

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
      const object = this.#idMap.get(ref.$ref);

      if (object)
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
      const object = this.#idMap.get(delta.ref.$ref);
      if (object)
        this.remove(object);
    }
  }

  override createSummary(encoder: IEncoder): IControlPointInfoSummary
  {
    return this.#controlPoints.map(it => encoder.encodeDDS(it));
  }

  override load(summary: unknown, version: number, decoder: IDecoder): void
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
