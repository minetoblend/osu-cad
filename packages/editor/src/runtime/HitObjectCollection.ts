import type { DDSAttributes, DDSRef, IDDSSummary, IDecoder, IEncodedDelta, IEncoder } from "@osucad/multiplayer-core";
import { DDS, Delta, nn } from "@osucad/multiplayer-core";
import { HitObject } from "@osucad/core";
import { Action } from "@osucad/framework";

export class HitObjectCollection extends DDS
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

  protected override process(delta: Delta, local: boolean): void
  {
    if (local)
      return;

    if (delta instanceof AddHitObjectDelta)
    {
      const hitObject = nn(this.decoder.decodeDDS(delta.ref));
      if (!(hitObject instanceof HitObject))
        throw new Error("Not a HitObject");

      this.#add(hitObject);
    }
    else if (delta instanceof RemoveHitObjectDelta)
    {
      const hitObject = this.#idMap.get(delta.ref.$ref);
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

  override decodeDelta(delta: IEncodedDelta): Delta
  {
    switch (delta.type)
    {
    case "add": {
      const ref = delta.content as DDSRef;

      return new AddHitObjectDelta(ref, null);
    }
    case "remove": {
      const { ref } = delta.content as RemoveHitObjectDelta;

      return new RemoveHitObjectDelta(ref);
    }
    default:
      throw new Error(`Invalid delta type "${delta.type}"`);
    }
  }
}

class AddHitObjectDelta extends Delta
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

  constructor(readonly ref: DDSRef, readonly summary: IDDSSummary | null)
  {
    super("add");
  }

  encode()
  {
    return this.ref;
  }
}

class RemoveHitObjectDelta extends Delta
{
  static create(hitObject: HitObject, encoder: IEncoder)
  {
    const ref = encoder.encodeDDS(hitObject);

    return new RemoveHitObjectDelta(ref);
  }

  constructor(readonly ref: DDSRef)
  {
    super("remove");
  }

  encode()
  {
    return { ref: this.ref };
  }
}
