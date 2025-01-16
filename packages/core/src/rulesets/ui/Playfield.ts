import type { IFrameBasedClock, NoArgsConstructor } from '@osucad/framework';
import type { DrawableHitObject } from '../../hitObjects/drawables/DrawableHitObject';
import type { HitObjectJudge } from '../../hitObjects/drawables/HitObjectJudge';
import type { HitObject } from '../../hitObjects/HitObject';
import type { Constructor } from '../../utils/Constructor';
import type { JudgementResult } from '../judgements/JudgementResult';
import { Action, Axes, Container, dependencyLoader, DrawablePool, Lazy, provide, resolved } from '@osucad/framework';
import { PlayfieldClock } from '../../gameplay/PlayfieldClock';
import { IHitObjectJudgeProvider } from '../../hitObjects/drawables/HitObjectJudge';
import { HitObjectLifetimeEntry } from '../../hitObjects/drawables/HitObjectLifetimeEntry';
import { IPooledHitObjectProvider } from '../../hitObjects/drawables/IPooledHitObjectProvider';
import { HitObjectEntryManager } from '../pooling/HitObjectEntryManager';
import { HitObjectContainer } from './HitObjectContainer';

@provide(IPooledHitObjectProvider)
@provide(IHitObjectJudgeProvider)
@provide(Playfield)
export class Playfield extends Container implements IPooledHitObjectProvider, IHitObjectJudgeProvider {
  #hitObjectContainerLazy: Lazy<HitObjectContainer>;

  get hitObjectContainer() {
    return this.#hitObjectContainerLazy.value;
  }

  get allHitObjects() {
    let objects = this.hitObjectContainer.objects;

    if (this.isNested) {
      objects = [
        ...objects,
        ...this.#nestedPlayfields.flatMap(p => p.hitObjectContainer.objects),
      ];
    }

    return objects;
  }

  readonly #nestedPlayfields: Playfield[] = [];

  get nestedPlayfields(): readonly Playfield[] {
    return this.#nestedPlayfields;
  }

  isNested = false;

  #entryManager = new HitObjectEntryManager();

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.#hitObjectContainerLazy = new Lazy(() => {
      const container = this.createHitObjectContainer();

      container.newResult.addListener(this.#onNewResult, this);
      container.hitObjectUsageBegan.addListener(hitObject => this.hitObjectUsageBegan.emit(hitObject));
      container.hitObjectUsageFinished.addListener(hitObject => this.hitObjectUsageFinished.emit(hitObject));

      return container;
    });

    this.#entryManager.onEntryAdded.addListener(([entry, parent]) => this.#onEntryAdded(entry, parent));
    this.#entryManager.onEntryRemoved.addListener(([entry, parent]) => this.#onEntryRemoved(entry, parent));
  }

  #onEntryAdded(entry: HitObjectLifetimeEntry, parent?: HitObject) {
    if (parent)
      return;

    this.hitObjectContainer.addEntry(entry);
    this.onHitObjectAdded(entry.hitObject!);
  }

  #onEntryRemoved(entry: HitObjectLifetimeEntry, parent?: HitObject) {
    if (parent)
      return;

    this.hitObjectContainer.removeEntry(entry);
    this.onHitObjectRemoved(entry.hitObject!);
  }

  #onNewResult([hitObject, result]: [DrawableHitObject, JudgementResult]) {
    this.newResult.emit([hitObject, result]);
  }

  newResult = new Action<[DrawableHitObject, JudgementResult]>();

  protected onHitObjectAdded(hitObject: HitObject) {}

  protected onHitObjectRemoved(hitObject: HitObject) {}

  hitObjectUsageBegan = new Action<HitObject>();

  hitObjectUsageFinished = new Action<HitObject>();

  protected createHitObjectContainer(): HitObjectContainer {
    return new HitObjectContainer();
  }

  @resolved(PlayfieldClock)
  playfieldClock!: IFrameBasedClock;

  @dependencyLoader()
  [Symbol('load')]() {
    this.clock = this.playfieldClock;
    this.processCustomClock = false;
  }

  protected override loadComplete() {
    super.loadComplete();

    if (!this.hitObjectContainer.parent)
      this.addInternal(this.hitObjectContainer);
  }

  addHitObject(hitObject: HitObject) {
    const entry = this.createLifeTimeEntry(hitObject);
    this.#entryManager.add(entry);
  }

  removeHitObject(hitObject: HitObject): boolean {
    const entry = this.#entryManager.get(hitObject);
    if (entry) {
      this.#entryManager.remove(entry);
      return true;
    }

    return this.#nestedPlayfields.some(p => p.removeHitObject(hitObject));
  }

  addDrawableHitObject(h: DrawableHitObject) {
    if (!h.isInitialized)
      this.#onNewDrawableHitObject(h);

    this.hitObjectContainer.add(h);
    this.onHitObjectAdded(h.hitObject!);
  }

  removeDrawableHitObject(h: DrawableHitObject) {
    if (!this.hitObjectContainer.remove(h))
      return false;
    this.onHitObjectRemoved(h.hitObject!);

    return false;
  }

  protected createLifeTimeEntry(hitObject: HitObject) {
    return new HitObjectLifetimeEntry(hitObject);
  }

  #pools = new Map<NoArgsConstructor<HitObject>, DrawablePool<DrawableHitObject>>();

  protected registerPool(
    hitObjectClass: Constructor<HitObject>,
    drawableClass: NoArgsConstructor<DrawableHitObject>,
    initialSize: number,
    maximumSize?: number,
  ) {
    this.#registerPool(hitObjectClass, new DrawablePool(drawableClass, initialSize, maximumSize));
  }

  #registerPool(hitObjectClass: Constructor<HitObject>, pool: DrawablePool<DrawableHitObject>) {
    this.#pools.set(hitObjectClass, pool);
    this.addInternal(pool);
  }

  getPooledDrawableRepresentation(hitObject: HitObject, parent?: DrawableHitObject): DrawableHitObject | undefined {
    const pool = this.#prepareDrawableHitObjectPool(hitObject);

    return pool?.get((drawable) => {
      const dho = drawable as DrawableHitObject;

      dho.suppressHitSounds = this.suppressHitSounds;
      dho.alwaysHit = this.hitObjectsAlwaysHit;

      if (!dho.isInitialized) {
        this.#onNewDrawableHitObject(dho);
      }

      let entry = this.#entryManager.get(hitObject);
      if (!entry) {
        entry = this.createLifeTimeEntry(hitObject);
        this.#entryManager.add(entry, parent?.hitObject);
      }

      dho.parentHitObject = parent ?? null;
      dho.apply(entry);
    });
  }

  #prepareDrawableHitObjectPool(hitObject: HitObject) {
    const lookupType = hitObject.constructor as Constructor<HitObject>;

    let pool = this.#pools.get(lookupType);
    if (!pool) {
      for (const [t, p] of this.#pools) {
        if (!(hitObject instanceof t))
          continue;

        this.#pools.set(lookupType, p);
        pool = p;
      }
    }

    return pool;
  }

  #onNewDrawableHitObject = (drawable: DrawableHitObject) => {
    drawable.onNestedDrawableCreated.addListener(this.#onNewDrawableHitObject);

    this.onNewDrawableHitObject(drawable);
    console.assert(!drawable.isInitialized);
    drawable.isInitialized = true;
  };

  protected onNewDrawableHitObject(drawable: DrawableHitObject) {

  }

  addNested(otherPlayfield: Playfield) {
    otherPlayfield.isNested = true;

    otherPlayfield.newResult.addListener(r => this.newResult.emit(r));
    otherPlayfield.hitObjectUsageBegan.addListener(h => this.hitObjectUsageBegan.emit(h));
    otherPlayfield.hitObjectUsageFinished.addListener(h => this.hitObjectUsageFinished.emit(h));

    this.#nestedPlayfields.push(otherPlayfield);
  }

  customJudgeProvider: IHitObjectJudgeProvider | null = null;

  suppressHitSounds = false;
  hitObjectsAlwaysHit = false;

  withCustomJudgeProvider(provider: IHitObjectJudgeProvider) {
    this.customJudgeProvider = provider;

    return this;
  }

  getJudge(hitObject: DrawableHitObject): HitObjectJudge | null {
    if (this.customJudgeProvider)
      return this.customJudgeProvider.getJudge(hitObject);

    return null;
  }

  get pastLifetimeExtension() {
    return this.hitObjectContainer.pastLifetimeExtension;
  }

  set pastLifetimeExtension(value: number) {
    this.hitObjectContainer.pastLifetimeExtension = value;

    for (const playfield of this.#nestedPlayfields)
      playfield.pastLifetimeExtension = value;
  }

  get futureLifetimeExtension() {
    return this.hitObjectContainer.futureLifetimeExtension;
  }

  set futureLifetimeExtension(value: number) {
    this.hitObjectContainer.futureLifetimeExtension = value;

    for (const playfield of this.#nestedPlayfields)
      playfield.futureLifetimeExtension = value;
  }
}
