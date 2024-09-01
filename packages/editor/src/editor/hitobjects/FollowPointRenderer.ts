import type { Bindable } from 'osucad-framework';
import { DrawablePool, SortedList, dependencyLoader } from 'osucad-framework';
import { PooledDrawableWithLifetimeContainer } from '../../pooling/PooledDrawableWithLifetimeContainer';
import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { FollowPointLifetimeEntry } from './FollowPointLifetimeEntry';
import { FollowPointConnection } from './FollowPointConnection';
import { FollowPoint } from './FollowPoint';

export class FollowPointRenderer extends PooledDrawableWithLifetimeContainer<FollowPointLifetimeEntry, FollowPointConnection> {
  constructor() {
    super();
  }

  #connectionPool!: DrawablePool<FollowPointConnection>;
  #pointPool!: DrawablePool<FollowPoint>;

  #lifetimeEntries = new SortedList<FollowPointLifetimeEntry>({
    compare(a: FollowPointLifetimeEntry, b: FollowPointLifetimeEntry): number {
      const comp = a.start.startTime - b.start.startTime;

      if (comp !== 0)
        return comp;

      return -1;
    },
  });

  #startTimeMap = new Map<OsuHitObject, Bindable<any>>();

  @dependencyLoader()
  load() {
    this.internalChildren = [
      this.#connectionPool = new DrawablePool(FollowPointConnection, 10, 200),
      this.#pointPool = new DrawablePool(FollowPoint, 50, 1000),
    ];
  }

  addFollowPoints(hitObject: OsuHitObject) {
    this.#addEntry(hitObject);

    const startTimeBindable = hitObject.startTimeBindable.getBoundCopy();
    startTimeBindable.valueChanged.addListener(() => this.#onStartTimeChanged(hitObject));
    this.#startTimeMap.set(hitObject, startTimeBindable);
  }

  removeFollowPoints(hitObject: OsuHitObject) {
    this.#removeEntry(hitObject);

    this.#startTimeMap.get(hitObject)?.unbindAll();
    this.#startTimeMap.delete(hitObject);
  }

  #addEntry(hitObject: OsuHitObject) {
    const newEntry = new FollowPointLifetimeEntry(hitObject);

    const index = this.#lifetimeEntries.add(newEntry);

    if (index < this.#lifetimeEntries.length - 1) {
      const nextEntry = this.#lifetimeEntries.get(index + 1)!;
      newEntry.end = nextEntry.start;
    }
    else {
      newEntry.end = null;
    }

    if (index > 0) {
      const previousEntry = this.#lifetimeEntries.get(index - 1)!;
      previousEntry.end = newEntry.start;
    }

    this.addEntry(newEntry);
  }

  protected addDrawable(entry: FollowPointLifetimeEntry, drawable: FollowPointConnection) {
    super.addDrawable(entry, drawable);
  }

  #removeEntry(hitObject: OsuHitObject) {
    const index = this.#lifetimeEntries.findIndex(entry => entry.start === hitObject);

    const entry = this.#lifetimeEntries.get(index)!;
    entry.unbindEvents();

    this.#lifetimeEntries.removeAt(index);
    this.removeEntry(entry);

    if (index > 0) {
      const previousEntry = this.#lifetimeEntries.get(index - 1)!;
      previousEntry.end = entry.end;
    }
  }

  getDrawable(entry: FollowPointLifetimeEntry): FollowPointConnection {
    const connection = this.#connectionPool.get();
    connection.pool = this.#pointPool;
    connection.apply(entry);
    return connection;
  }

  #onStartTimeChanged(hitObject: OsuHitObject) {
    this.#removeEntry(hitObject);
    this.#addEntry(hitObject);
  }

  dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    for (const entry of this.#lifetimeEntries)
      entry.unbindEvents();
    this.#lifetimeEntries.clear();
  }
}
