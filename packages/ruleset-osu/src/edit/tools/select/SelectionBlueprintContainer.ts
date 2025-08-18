import type { DrawableHitObject, HitObject } from "@osucad/core";
import { HitObjectLifetimeEntry, Playfield } from "@osucad/core";
import type { ObservableSet , Bindable } from "@osucad/framework";
import { Axes, Box, CompositeDrawable, LifetimeEntryManager, LoadState, provideSelf, resolved } from "@osucad/framework";
import { EditorBeatmap, EditorClock } from "@osucad/editor";
import type { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";

@provideSelf()
export abstract class SelectionBlueprintContainer<T extends HitObject> extends CompositeDrawable
{
  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(readonly selection: ObservableSet<T>)
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(Playfield)
  accessor #playfield!: Playfield;

  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap;

  @resolved(EditorClock)
  accessor #editorClock!: EditorClock;

  readonly #blueprints = new Map<HitObject, HitObjectSelectionBlueprint<any>>();
  readonly #lifetimeManager = new LifetimeEntryManager();
  readonly #entryMap = new Map<HitObject, HitObjectLifetimeEntry>();
  readonly #startTimeMap = new Map<HitObjectSelectionBlueprint<any>, Bindable<number>>();
  readonly #drawableHitObjects = new Map<HitObject, DrawableHitObject>();

  protected override loadComplete(): void
  {
    super.loadComplete();

    for (const hitObject of this.#beatmap.hitObjects)
      this.#addHitObject(hitObject);

    this.#beatmap.hitObjects.added.addListener(this.#addHitObject, this);
    this.#beatmap.hitObjects.removed.addListener(this.#removeHitObject, this);

    this.#lifetimeManager.entryBecameAlive.addListener(entry => this.#entryBecameAlive(entry as HitObjectLifetimeEntry), this);
    this.#lifetimeManager.entryBecameDead.addListener(entry => this.#entryBecameDead(entry as HitObjectLifetimeEntry), this);

    this.#playfield.hitObjectContainer.drawableHitObjectBecameAlive.addListener(this.#hitObjectDrawableBecameAlive, this);
    this.#playfield.hitObjectContainer.hitObjectUsageFinished.addListener(this.#hitObjectBecameDead, this);

    this.selection.added.addListener(this.#hitObjectSelected, this);
    this.selection.removed.addListener(this.#hitObjectDeselected, this);

    for (const drawable of this.#playfield.hitObjectContainer.aliveObjects)
      this.#hitObjectDrawableBecameAlive(drawable);
  }

  #addHitObject(hitObject: HitObject)
  {
    const entry = this.createLifetimeEntry(hitObject as T);

    this.#entryMap.set(hitObject, entry);
    this.#lifetimeManager.addEntry(entry);
  }

  #removeHitObject(hitObject: HitObject)
  {
    const entry = this.#entryMap.get(hitObject);
    if (!entry)
      return;

    this.#lifetimeManager.removeEntry(entry);
  }

  #entryBecameAlive(entry: HitObjectLifetimeEntry)
  {
    const blueprint = this.getBlueprintFor(entry.hitObject as T);
    if (!blueprint)
      return;

    this.#bindStartTime(blueprint);

    this.#blueprints.set(entry.hitObject, blueprint);
    this.addInternal(blueprint);

    blueprint.setSelected(this.selection.has(entry.hitObject as T));

    const dho = this.#drawableHitObjects.get(blueprint.hitObject);

    if (dho)
      blueprint.drawableBecameAlive(dho);
  }

  #entryBecameDead(entry: HitObjectLifetimeEntry)
  {
    const blueprint = this.#blueprints.get(entry.hitObject);
    if (!blueprint)
      return;

    this.#blueprints.delete(entry.hitObject);
    this.removeInternal(blueprint);

    this.#unbindStartTime(blueprint);
  }

  #hitObjectDrawableBecameAlive(drawable: DrawableHitObject)
  {
    this.#drawableHitObjects.set(drawable.hitObject, drawable);


    const blueprint = this.#blueprints.get(drawable.hitObject);
    blueprint?.drawableBecameAlive(drawable);
  }

  #hitObjectBecameDead(hitObject: HitObject)
  {
    const dho = this.#drawableHitObjects.get(hitObject);
    if (!dho)
      return;

    const blueprint = this.#blueprints.get(hitObject);
    blueprint?.drawableBecameDead(dho);
  }

  #bindStartTime(blueprint: HitObjectSelectionBlueprint<any>)
  {
    const bindable = blueprint.hitObject.startTimeBindable.getBoundCopy();

    bindable.bindValueChanged(() =>
    {
      if (this.loadState >= LoadState.Ready)
      {
        if (blueprint.parent)
          blueprint.parent.changeInternalChildDepth(blueprint, this.getDrawableDepth(blueprint));
        else
          blueprint.depth = this.getDrawableDepth(blueprint);
      }
    }, true);

    this.#startTimeMap.set(blueprint, bindable);
  }

  #unbindStartTime(blueprint: HitObjectSelectionBlueprint<any>)
  {
    this.#startTimeMap.get(blueprint)?.unbindAll();
    this.#startTimeMap.delete(blueprint);
  }

  #hitObjectSelected(hitObject: T)
  {
    const entry = this.#entryMap.get(hitObject);
    if (entry)
      entry.keepAlive = true;

    const blueprint = this.#blueprints.get(hitObject);
    blueprint?.setSelected(true);
  }

  #hitObjectDeselected(hitObject: T)
  {
    const entry = this.#entryMap.get(hitObject);
    if (entry)
      entry.keepAlive = false;

    const blueprint = this.#blueprints.get(hitObject);
    blueprint?.setSelected(false);
  }

  protected getDrawableDepth(drawable: HitObjectSelectionBlueprint<any>)
  {
    return drawable.hitObject.startTime;
  }

  get allBlueprints()
  {
    return this.#blueprints.values();
  }

  get selectedObjects()
  {
    return this.#blueprints.values().filter(it => it.selected);
  }

  protected createLifetimeEntry(hitObject: T): HitObjectLifetimeEntry
  {
    return new HitObjectLifetimeEntry(hitObject);
  }

  protected abstract getBlueprintFor(hitObject: T): HitObjectSelectionBlueprint<T> | null;

  override checkChildrenLife(): boolean
  {
    if (!this.isPresent)
      return false;

    let aliveChanged = super.checkChildrenLife();
    if (this.#lifetimeManager.update(this.#editorClock.currentTime))
      aliveChanged = true;

    return aliveChanged;
  }

  override dispose()
  {
    this.#beatmap.hitObjects.added.removeListener(this.#addHitObject, this);
    this.#beatmap.hitObjects.removed.removeListener(this.#removeHitObject, this);

    this.#playfield.hitObjectContainer.drawableHitObjectBecameAlive.removeListener(this.#hitObjectDrawableBecameAlive, this);
    this.#playfield.hitObjectContainer.hitObjectUsageFinished.removeListener(this.#hitObjectBecameDead, this);

    this.selection.added.removeListener(this.#hitObjectSelected, this);
    this.selection.removed.removeListener(this.#hitObjectDeselected, this);

    super.dispose();
  }
}
