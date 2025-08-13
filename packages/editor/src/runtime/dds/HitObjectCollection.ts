import type { DDSAttributes, DDSRef, IDDSSummary, IDecoder, IEncodedDelta, IEncoder } from "@osucad/multiplayer-core";
import { DDS, Delta, nn } from "@osucad/multiplayer-core";
import { HitObject } from "@osucad/core";
import { Action, Lazy } from "@osucad/framework";
import { createHitObjectCollectionProxy } from "./HitObjectCollectionProxy";

enum OpType
{
  Add = 0,
  Remove = 1,
}

export type IAddHitObjectDelta = [OpType.Add, DDSRef];
export type IRemoveHitObjectDelta = [OpType.Remove, DDSRef];
export type IHitObjectCollectionDelta = IAddHitObjectDelta | IRemoveHitObjectDelta;

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

export class HitObjectCollection extends DDS<IHitObjectCollectionDelta> implements Iterable<HitObject>
{
  readonly added = new Action<HitObject>();
  readonly removed = new Action<HitObject>();

  static readonly attributes: DDSAttributes = {
    type: "@osucad/hitobject-collection",
    version: 0,
  };

  constructor()
  {
    super(HitObjectCollection.attributes);
  }

  readonly #hitObjects: HitObject[] = [];
  readonly #idMap = new Map<string, HitObject>();

  get hitObjects(): readonly HitObject[]
  {
    return this.#hitObjects;
  }

  get length()
  {
    return this.#hitObjects.length;
  }

  add(hitObject: HitObject)
  {
    if (!this.#add(hitObject))
      return;

    if (this.isAttached)
    {

      const delta = AddHitObjectDelta.create(hitObject, this.encoder);
      const undo = RemoveHitObjectDelta.create(hitObject, this.encoder);

      this.submitDelta(delta, undo);
    }
  }

  #add(hitObject: HitObject)
  {
    this.encoder.encodeDDS(hitObject);

    const id = nn(hitObject.id);

    if (this.#idMap.has(id))
      return false;

    this.#idMap.set(id, hitObject);
    this.#hitObjects.push(hitObject);

    this.added.emit(hitObject);

    return true;
  }

  remove(hitObject: HitObject)
  {
    if (!this.#remove(hitObject))
      return;

    if (this.isAttached)
    {

      const delta = RemoveHitObjectDelta.create(hitObject, this.encoder);
      const undo = AddHitObjectDelta.create(hitObject, this.encoder);

      this.submitDelta(delta, undo);
    }
  }

  #remove(hitObject: HitObject)
  {
    const id = nn(hitObject.id);
    if (!this.#idMap.delete(id))
      return false;

    const index = this.#hitObjects.indexOf(hitObject);
    this.#hitObjects.splice(index, 1);

    this.removed.emit(hitObject);

    return true;
  }

  protected override process([opType, ref]: IHitObjectCollectionDelta, local: boolean): void
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
      const hitObject = this.#idMap.get(ref.$ref);
      if (hitObject)
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
        const factory = nn(this.runtime!.typeRegistry.get(delta.summary!.attributes));

        hitObject = factory.create();
      }

      if (!(hitObject instanceof HitObject))
        throw new Error("Not a hitobject");

      this.add(hitObject);
    }
    else if (delta instanceof RemoveHitObjectDelta)
    {
      const hitObject = this.#idMap.get(delta.ref.$ref);
      if (hitObject)
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

  forEach(callbackfn: (value: HitObject, index: number, array: readonly HitObject[]) => void, thisArg?: any)
  {
    this.hitObjects.forEach(callbackfn, thisArg);
  }

  map<U>(callbackfn: (value: HitObject, index: number, array: readonly HitObject[]) => U, thisArg?: any): U[]
  {
    return this.hitObjects.map(callbackfn, thisArg);
  }

  filter<S extends HitObject>(predicate: (value: HitObject, index: number, array: readonly HitObject[]) => value is S, thisArg?: any): S[];
  filter(predicate: (value: HitObject, index: number, array: readonly HitObject[]) => unknown, thisArg?: any): HitObject[];
  filter(predicate: (value: HitObject, index: number, array: readonly HitObject[]) => boolean, thisArg?: any)
  {
    return this.hitObjects.filter(predicate, thisArg);
  }

  ofType<T extends Constructor<HitObject>[]>(...types: T): { [K in keyof T]: InstanceType<T[K]> }[number][]
  {
    return this.hitObjects.filter(hitObject =>
    {
      for (const type of types)
        if (hitObject instanceof type)
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

type Constructor<T> = (new (...args: any[]) => T);
