import type {
  DDSAttributes,
  DDSRef,
  IDDSSummary,
  IDecoder,
  IEncodedDelta,
  IEncoder,
} from "@osucad/multiplayer-core";
import { DDS, Delta, nn } from "@osucad/multiplayer-core";
import type { HitObjectInivalidationType } from "@osucad/core";
import { HitObject } from "@osucad/core";
import { Action, Lazy } from "@osucad/framework";
import { createHitObjectCollectionProxy } from "./HitObjectCollectionProxy";
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

class AddHitObjectDelta extends Delta<IAddHitObjectDelta>
{
  static create(hitObject: HitObject, encoder: IEncoder)
  {
    const ref = encoder.encodeDDS(hitObject);

    const summary: IDDSSummary = {
      attributes: hitObject.attributes,
      content: hitObject.createSummary(encoder),
    };

    return new AddHitObjectDelta(ref, summary);
  }

  constructor(readonly ref: DDSRef, readonly summary: IDDSSummary)
  {
    super();
  }

  encode(): IAddHitObjectDelta
  {
    return [OpType.Add, this.ref];
  }
}

class RemoveHitObjectDelta extends Delta<IRemoveHitObjectDelta>
{
  static create(hitObject: HitObject, encoder: IEncoder)
  {
    const ref = encoder.encodeDDS(hitObject);

    return new RemoveHitObjectDelta(ref);
  }

  constructor(readonly ref: DDSRef)
  {
    super();
  }

  encode(): IRemoveHitObjectDelta
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
  readonly added = new Action<HitObject>();
  readonly removed = new Action<HitObject>();

  readonly invalidated = new EventEmitter<HitObjectInvalidationEvents>();

  static readonly attributes: DDSAttributes = {
    type: "@osucad/hitobject-collection",
    version: 0,
  };

  constructor()
  {
    super(HitObjectCollection.attributes);
  }

  readonly #hitObjects: HitObject[] = [];
  readonly #set = new Set<HitObject>();

  get hitObjects(): readonly HitObject[]
  {
    return this.#hitObjects;
  }

  get length()
  {
    return this.#hitObjects.length;
  }

  add(hitObject: HitObject, local = false)
  {
    if (this.isAttached() && !local)
      this.encoder.encodeDDS(hitObject);

    if (!this.#add(hitObject) || local)
      return false;

    if (this.isAttached())
    {
      const delta = AddHitObjectDelta.create(hitObject, this.encoder);
      const undo = RemoveHitObjectDelta.create(hitObject, this.encoder);

      this.submitDelta(delta, undo);
    }

    return true;
  }

  ensureAttached(hitObject: HitObject)
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
    this.#hitObjects.sort((a, b) => a.startTime - b.startTime);
  }

  remove(hitObject: HitObject)
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

  override createSummary(encoder: IEncoder): unknown
  {
    const entries: DDSRef[] = [];

    for (const hitObject of this.#hitObjects)
      entries.push(encoder.encodeDDS(hitObject));

    return entries;
  }

  override load(summary: unknown, version: number, decoder: IDecoder): void
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

  forEach(
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

  map<U>(
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

  filter<S extends HitObject>(
    predicate: (
      value: HitObject,
      index: number,
      array: readonly HitObject[]
    ) => value is S,
    thisArg?: any
  ): S[];
  filter(
    predicate: (
      value: HitObject,
      index: number,
      array: readonly HitObject[]
    ) => unknown,
    thisArg?: any
  ): HitObject[];
  filter(
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

  find(
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

  unsafeCast<T extends HitObject>(): readonly T[]
  {
    return this.hitObjects as readonly T[];
  }

  ofType<T extends Constructor<HitObject>[]>(
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
    return this.hitObjects[Symbol.iterator]();
  }

  #proxy = new Lazy(() => createHitObjectCollectionProxy(this));

  get proxy()
  {
    return this.#proxy.value;
  }
}

type Constructor<T> = { prototype: T };
type InstanceOf<T> = T extends Constructor<infer U> ? U : never;
