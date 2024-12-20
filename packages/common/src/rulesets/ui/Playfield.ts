import type { IFrameBasedClock, NoArgsConstructor } from 'osucad-framework';
import type { DrawableHitObject } from '../../hitObjects/drawables/DrawableHitObject';
import type { HitObjectJudge } from '../../hitObjects/drawables/HitObjectJudge';
import type { HitObject } from '../../hitObjects/HitObject';
import type { JudgementResult } from '../../hitObjects/JudgementResult';
import type { Constructor } from '../../utils/Constructor';
import { Action, Axes, Container, dependencyLoader, DrawablePool, Lazy, provide, resolved } from 'osucad-framework';
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
    return this.hitObjectContainer.objects;
  }

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
    if (!entry)
      return false;

    this.#entryManager.remove(entry);
    return true;
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
}
