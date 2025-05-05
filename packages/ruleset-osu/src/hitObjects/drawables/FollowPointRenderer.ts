import type { Bindable, ReadonlyDependencyContainer } from "@osucad/framework";
import type { OsuHitObject } from "../OsuHitObject";
import { PooledDrawableWithLifetimeContainer } from "@osucad/core";
import { DrawablePool, SortedList } from "@osucad/framework";
import { FollowPoint } from "./FollowPoint";
import { FollowPointConnection } from "./FollowPointConnection";
import { FollowPointLifetimeEntry } from "./FollowPointLifetimeEntry";

export class FollowPointRenderer extends PooledDrawableWithLifetimeContainer<FollowPointLifetimeEntry, FollowPointConnection>
{
  constructor()
  {
    super();

    this.drawNode.enableRenderGroup();
  }

  #connectionPool!: DrawablePool<FollowPointConnection>;
  #pointPool!: DrawablePool<FollowPoint>;

  #lifetimeEntries = new SortedList<FollowPointLifetimeEntry>({
    compare(a: FollowPointLifetimeEntry, b: FollowPointLifetimeEntry): number
    {
      const comp = a.start.startTime - b.start.startTime;

      if (comp !== 0)
        return comp;

      return a.uid - b.uid;
    },
  });

  #startTimeMap = new Map<OsuHitObject, Bindable<any>>();

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.internalChildren = [
      this.#connectionPool = new DrawablePool(FollowPointConnection, 10, 200),
      this.#pointPool = new DrawablePool(FollowPoint, 50, 1000),
    ];
  }

  addFollowPoints(hitObject: OsuHitObject)
  {
    this.#addEntry(hitObject);

    const startTimeBindable = hitObject.startTimeBindable.getBoundCopy();
    startTimeBindable.valueChanged.addListener(() => this.#onStartTimeChanged(hitObject));
    this.#startTimeMap.set(hitObject, startTimeBindable);
  }

  removeFollowPoints(hitObject: OsuHitObject)
  {
    this.#removeEntry(hitObject);

    this.#startTimeMap.get(hitObject)?.unbindAll();
    this.#startTimeMap.delete(hitObject);
  }

  #addEntry(hitObject: OsuHitObject)
  {
    const newEntry = new FollowPointLifetimeEntry(hitObject);

    const index = this.#lifetimeEntries.add(newEntry);

    if (index < this.#lifetimeEntries.length - 1)
    {
      const nextEntry = this.#lifetimeEntries.get(index + 1)!;
      newEntry.end = nextEntry.start;
    }
    else
    {
      newEntry.end = null;
    }

    if (index > 0)
    {
      const previousEntry = this.#lifetimeEntries.get(index - 1)!;
      previousEntry.end = newEntry.start;
    }

    this.addEntry(newEntry);
  }

  #removeEntry(hitObject: OsuHitObject)
  {
    const index = this.#lifetimeEntries.findIndex(entry => entry.start === hitObject);

    if (index < 0)
      return;

    const entry = this.#lifetimeEntries.get(index)!;
    entry.unbindEvents();

    this.#lifetimeEntries.removeAt(index);
    this.removeEntry(entry);

    if (index > 0)
    {
      const previousEntry = this.#lifetimeEntries.get(index - 1)!;
      previousEntry.end = entry.end;
    }
  }

  getDrawable(entry: FollowPointLifetimeEntry): FollowPointConnection
  {
    const connection = this.#connectionPool.get();
    connection.pool = this.#pointPool;
    connection.apply(entry);
    return connection;
  }

  #onStartTimeChanged(hitObject: OsuHitObject)
  {
    this.#removeEntry(hitObject);
    this.#addEntry(hitObject);
  }

  override dispose(isDisposing: boolean = true)
  {
    super.dispose(isDisposing);

    for (const entry of this.#lifetimeEntries)
      entry.unbindEvents();
    this.#lifetimeEntries.clear();
  }
}
