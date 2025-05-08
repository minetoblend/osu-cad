import { CompositeDrawable } from "./CompositeDrawable";
import { LifetimeEntry } from "../performance/LifetimeEntry";
import { LifetimeEntryManager } from "../performance/LifetimeEntryManager";
import type { Drawable, DrawableOptions } from "../drawables/Drawable";
import { LoadState } from "../drawables/Drawable";
import type { LifetimeBoundaryKind } from "../performance/LifetimeBoundaryKind";
import type { LifetimeBoundaryCrossingDirection } from "../performance/LifetimeBoundaryCrossingDirection";

export class LifetimeManagementContainer extends CompositeDrawable
{

  readonly #manager = new LifetimeEntryManager();

  readonly #drawableMap = new Map<Drawable, DrawableLifetimeEntry>();

  #unmanagedDrawablesToProcess: Drawable[] = [];

  constructor(options: DrawableOptions = {})
  {
    super();

    this.#manager.entryBecameAlive.addListener(this.#entryBecameAlive, this);
    this.#manager.entryBecameDead.addListener(this.#entryBecameDead, this);
    this.#manager.entryCrossedBoundary.addListener(this.#entryCrossedBoundary, this);

    this.with(options);
  }

  protected override addInternal<T extends Drawable>(drawable: T, withManagedLifetime = true): undefined | T
  {
    const result = super.addInternal(drawable);

    if (withManagedLifetime)
    {
      const entry = new DrawableLifetimeEntry(drawable);

      this.#drawableMap.set(drawable, entry);
      this.#manager.addEntry(entry);
    }
    else if (drawable.loadState >= LoadState.Ready)
      this.makeChildAlive(drawable);
    else
      this.#unmanagedDrawablesToProcess.push(drawable);

    return result;
  }

  protected override removeInternal(drawable: Drawable, disposeImmediately: boolean = true): boolean
  {
    const index = this.#unmanagedDrawablesToProcess.indexOf(drawable);
    if (index >= 0)
      this.#unmanagedDrawablesToProcess.splice(index, 1);

    const entry = this.#drawableMap.get(drawable);
    if (!entry)
      return super.removeInternal(drawable, disposeImmediately);


    this.#manager.removeEntry(entry);
    this.#drawableMap.delete(drawable);

    entry.dispose();

    return super.removeInternal(drawable, disposeImmediately);
  }

  protected override clearInternal(disposeChildren: boolean = true): void
  {
    this.#manager.clearEntries();
    this.#unmanagedDrawablesToProcess = [];

    for (const [,entry] of this.#drawableMap)
      entry.dispose();
    this.#drawableMap.clear();

    super.clearInternal(disposeChildren);
  }

  public override checkChildrenLife(): boolean
  {
    let aliveChanged = this.#unmanagedDrawablesToProcess.length > 0;

    for (const d of this.#unmanagedDrawablesToProcess)
      this.makeChildAlive(d);
    this.#unmanagedDrawablesToProcess = [];

    if (this.#manager.update(this.time.current))
      aliveChanged = true;

    return aliveChanged;
  }

  #entryBecameAlive(entry: LifetimeEntry)
  {
    this.makeChildAlive((entry as DrawableLifetimeEntry).drawable);
  }

  #entryBecameDead(entry: LifetimeEntry)
  {
    const removed = this.makeChildDead((entry as DrawableLifetimeEntry).drawable);
    console.assert(!removed, "removeWhenNotAlive is not supported for children of LifetimeManagementContainer");
  }

  #entryCrossedBoundary(entry: LifetimeEntry, kind: LifetimeBoundaryKind, direction: LifetimeBoundaryCrossingDirection)
  {
    this.onChildLifetimeBoundaryCrossed(entry, kind, direction);
  }

  protected onChildLifetimeBoundaryCrossed (entry: LifetimeEntry, kind: LifetimeBoundaryKind, direction: LifetimeBoundaryCrossingDirection)
  {
  }
}

class DrawableLifetimeEntry extends LifetimeEntry
{
  constructor(readonly drawable: Drawable)
  {
    super();

    drawable.lifetimeChanged.addListener(this.#drawableLifetimeChanged, this);
    this.#drawableLifetimeChanged(drawable);
  }

  #drawableLifetimeChanged(drawable: Drawable)
  {
    this.lifetimeStart = drawable.lifetimeStart;
    this.lifetimeEnd = drawable.lifetimeEnd;
  }

  dispose()
  {
    this.drawable.lifetimeChanged.removeListener(this.#drawableLifetimeChanged, this);
  }
}
