import type { DDSAttributes, DDSRef, IDDSSummary, IDecoder, IEncoder } from "@osucad/multiplayer-core";
import { DDS, Delta, nn } from "@osucad/multiplayer-core";
import type { HitObjectInivalidationType } from "@osucad/core";
import { HitObject } from "@osucad/core";
import { Action, almostEquals } from "@osucad/framework";
import { EventEmitter } from "eventemitter3";

enum OpType
{
  Add = 0,
  Remove = 1,
}

export type IAddHitObjectDelta = [OpType.Add, DDSRef];
export type IRemoveHitObjectDelta = [OpType.Remove, DDSRef];
export type IHitObjectCollectionDelta =
  | IAddHitObjectDelta
  | IRemoveHitObjectDelta;

let uid = 0;

class AddHitObjectDelta extends Delta<IAddHitObjectDelta>
{
  public static create(hitObject: HitObject, encoder: IEncoder)
  {
    const ref = encoder.encodeDDS(hitObject);

    const summary: IDDSSummary = {
      attributes: hitObject.attributes,
      content: hitObject.createSummary(encoder),
    };

    return new AddHitObjectDelta(ref, summary);
  }

  public constructor(public readonly ref: DDSRef, public readonly summary: IDDSSummary)
  {
    super();
  }

  public encode(): IAddHitObjectDelta
  {
    return [OpType.Add, this.ref];
  }
}

class RemoveHitObjectDelta extends Delta<IRemoveHitObjectDelta>
{
  public static create(hitObject: HitObject, encoder: IEncoder)
  {
    const ref = encoder.encodeDDS(hitObject);

    return new RemoveHitObjectDelta(ref);
  }

  public constructor(public readonly ref: DDSRef)
  {
    super();
  }

  public encode(): IRemoveHitObjectDelta
  {
    return [OpType.Remove, this.ref];
  }
}

export interface HitObjectCollection
{
  readonly [n: number]: HitObject;
}

export type HitObjectInvalidationEvents = {
  all: (hitObject: HitObject) => void;
} & {
  [K in HitObjectInivalidationType]: (hitObject: HitObject) => void;
};

export class HitObjectCollection
  extends DDS<IHitObjectCollectionDelta>
  implements Iterable<HitObject>
{
  public readonly added = new Action<HitObject>();
  public readonly removed = new Action<HitObject>();

  public readonly invalidated = new EventEmitter<HitObjectInvalidationEvents>();

  public static readonly attributes: DDSAttributes = {
    type: "@osucad/hitobject-collection",
    version: 0,
  };

  public constructor()
  {
    super(HitObjectCollection.attributes);
  }

  readonly #hitObjects: HitObject[] = [];
  readonly #set = new Set<HitObject>();

  public get hitObjects(): readonly HitObject[]
  {
    return this.#hitObjects;
  }

  public get length()
  {
    return this.#hitObjects.length;
  }

  public add(hitObject: HitObject, localOnly = false)
  {
    if (this.isAttached() && !localOnly)
      this.encoder.encodeDDS(hitObject);

    if (!this.#add(hitObject) || localOnly)
      return false;

    if (this.isAttached())
    {
      const delta = AddHitObjectDelta.create(hitObject, this.encoder);
      const undo = RemoveHitObjectDelta.create(hitObject, this.encoder);

      this.submitDelta(delta, undo);
    }

    return true;
  }

  public ensureAttached(hitObject: HitObject)
  {
    if (hitObject.isAttached())
      return;

    if (this.add(hitObject))
      return;

    if (this.isAttached())
    {
      const delta = AddHitObjectDelta.create(hitObject, this.encoder);
      const undo = RemoveHitObjectDelta.create(hitObject, this.encoder);

      this.submitDelta(delta, undo);
    }
  }

  #add(hitObject: HitObject)
  {
    if (this.#set.has(hitObject))
      return false;

    hitObject.uid = ++uid;

    this.#set.add(hitObject);
    this.#hitObjects.push(hitObject);

    hitObject.invalidated.addListener(this.#onInvalidated, this);
    hitObject.startTimeBindable.valueChanged.addListener(this.#startTimeChanged, this);

    this.added.emit(hitObject);

    this.#startTimeChanged();

    return true;
  }

  #startTimeChanged()
  {
    this.#hitObjects.sort((a, b) =>
    {
      const diff = a.startTime - b.startTime;
      if (diff !== 0)
        return diff;

      return b.uid - a.uid;
    });
  }

  public remove(hitObject: HitObject)
  {
    if (!this.#remove(hitObject))
      return false;

    if (this.isAttached() && hitObject.isAttached())
    {
      const delta = RemoveHitObjectDelta.create(hitObject, this.encoder);
      const undo = AddHitObjectDelta.create(hitObject, this.encoder);

      this.submitDelta(delta, undo);
    }

    return true;
  }

  public removeRange(hitObjects: Iterable<HitObject>)
  {
    for (const h of hitObjects)
      this.remove(h);
  }

  #remove(hitObject: HitObject)
  {
    if (!this.#set.delete(hitObject))
      return false;

    const index = this.#hitObjects.indexOf(hitObject);
    this.#hitObjects.splice(index, 1);

    hitObject.invalidated.removeListener(this.#onInvalidated, this);
    hitObject.startTimeBindable.valueChanged.removeListener(this.#startTimeChanged, this);

    this.removed.emit(hitObject);

    return true;
  }

  #onInvalidated(
    hitObject: HitObject,
    invalidation: HitObjectInivalidationType,
  )
  {
    this.invalidated.emit(invalidation, hitObject);
    this.invalidated.emit("all", hitObject);
  }

  protected override process(
    [opType, ref]: IHitObjectCollectionDelta,
    local: boolean,
  ): void
  {
    if (local)
      return;

    if (opType === OpType.Add)
    {
      const hitObject = nn(this.decoder.decodeDDS(ref));
      if (!(hitObject instanceof HitObject))
        throw new Error("Not a HitObject");

      this.#add(hitObject);
    }
    else if (opType === OpType.Remove)
    {
      const hitObject = this.decoder.decodeDDS(ref);
      if (hitObject instanceof HitObject)
        this.#remove(hitObject);
    }
  }

  protected override replay(delta: Delta): void
  {
    if (delta instanceof AddHitObjectDelta)
    {
      let hitObject = this.decoder.decodeDDS(delta.ref);

      if (!hitObject)
      {
        const factory = nn(
            this.runtime!.typeRegistry.get(delta.summary!.attributes),
        );

        hitObject = factory.create();
      }

      if (!(hitObject instanceof HitObject))
        throw new Error("Not a hitobject");

      this.add(hitObject);
    }
    else if (delta instanceof RemoveHitObjectDelta)
    {
      const hitObject = this.decoder.decodeDDS(delta.ref);
      if (hitObject instanceof HitObject)
        this.remove(hitObject);
    }
  }

  public override createSummary(encoder: IEncoder): unknown
  {
    const entries: DDSRef[] = [];

    for (const hitObject of this.#hitObjects)
      entries.push(encoder.encodeDDS(hitObject));

    return entries;
  }

  public override load(summary: unknown, version: number, decoder: IDecoder): void
  {
    const entries = summary as DDSRef[];

    for (const entry of entries)
    {
      const hitObject = nn(decoder.decodeDDS(entry));
      if (!(hitObject instanceof HitObject))
        throw new Error("Not a hitobject");

      this.#add(hitObject);
    }
  }

  public hitObjectsWithStartTime(startTime: number, leniency: number = 1e-3)
  {
    return this.filter(hitObject => almostEquals(hitObject.startTime, startTime, leniency));
  }

  public removeHitObjectsWithStartTime(startTime: number, leniency: number = 1)
  {
    this.removeRange(this.hitObjectsWithStartTime(startTime, leniency));
  }

  public forEach(
    callbackfn: (
      value: HitObject,
      index: number,
      array: readonly HitObject[]
    ) => void,
    thisArg?: any,
  )
  {
    this.hitObjects.forEach(callbackfn, thisArg);
  }

  public map<U>(
    callbackfn: (
      value: HitObject,
      index: number,
      array: readonly HitObject[]
    ) => U,
    thisArg?: any,
  ): U[]
  {
    return this.hitObjects.map(callbackfn, thisArg);
  }

  public filter<S extends HitObject>(
    predicate: (
      value: HitObject,
      index: number,
      array: readonly HitObject[]
    ) => value is S,
    thisArg?: any
  ): S[];
  public filter(
    predicate: (
      value: HitObject,
      index: number,
      array: readonly HitObject[]
    ) => unknown,
    thisArg?: any
  ): HitObject[];
  public filter(
    predicate: (
      value: HitObject,
      index: number,
      array: readonly HitObject[]
    ) => boolean,
    thisArg?: any,
  )
  {
    return this.hitObjects.filter(predicate, thisArg);
  }

  public find(
    predicate: (
      value: HitObject,
      index: number,
      obj: readonly HitObject[]
    ) => boolean,
    thisArg?: any,
  ): HitObject | undefined
  {
    return this.hitObjects.find(predicate, thisArg);
  }

  public unsafeCast<T extends HitObject>(): readonly T[]
  {
    return this.hitObjects as readonly T[];
  }

  public ofType<T extends Constructor<HitObject>[]>(
    ...types: T
  ): { [K in keyof T]: InstanceOf<T[K]> }[number][]
  {
    return this.hitObjects.filter((hitObject) =>
    {
      for (const type of types)
        if (
          hitObject instanceof
          (type as abstract new (...args: any[]) => HitObject)
        )
          return true;

      return false;
    }) as any;
  }

  public [Symbol.iterator](): ArrayIterator<HitObject>
  {
    return this.hitObjects.values();
  }

  public get first(): HitObject | undefined
  {
    return this.#hitObjects[0];
  }

  public get last(): HitObject | undefined
  {
    return this.#hitObjects[this.#hitObjects.length - 1];
  }
}

type Constructor<T> = { prototype: T };
type InstanceOf<T> = T extends Constructor<infer U> ? U : never;
