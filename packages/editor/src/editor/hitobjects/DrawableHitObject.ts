import type { HitObject } from '../../beatmap/hitObjects/HitObject';
import type { HitObjectLifetimeEntry } from './HitObjectLifetimeEntry';
import { Action, Bindable, dependencyLoader, resolved } from 'osucad-framework';
import { Color } from 'pixi.js';
import { Beatmap } from '../../beatmap/Beatmap';
import { hasComboInformation } from '../../beatmap/hitObjects/IHasComboInformation';
import { PoolableDrawableWithLifetime } from '../../pooling/PoolableDrawableWithLifetime';

import { IAnimationTimeReference } from '../../skinning/IAnimationTimeReference.ts';
import { IPooledHitObjectProvider } from './IPooledHitObjectProvider';
import { SyntheticHitObjectEntry } from './SyntheticHitObjectEntry';

export class DrawableHitObject extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry> implements IAnimationTimeReference {
  defaultsApplied = new Action<DrawableHitObject>();

  hitObjectApplied = new Action<DrawableHitObject>();

  @dependencyLoader()
  [Symbol('load')]() {
    this.dependencies.provide(DrawableHitObject, this);
    this.dependencies.provide(IAnimationTimeReference, this);
  }

  get hitObject(): HitObject | undefined {
    return this.entry?.hitObject;
  }

  parentHitObject: DrawableHitObject | null = null;

  readonly accentColor = new Bindable(new Color(0xFFFFFF));

  readonly #nestedHitObjects: DrawableHitObject[] = [];

  get nestedHitObjects(): ReadonlyArray<DrawableHitObject> {
    return this.#nestedHitObjects;
  }

  readonly onNestedDrawableCreated = new Action<DrawableHitObject>();

  private readonly comboIndexBindable = new Bindable(0);

  readonly startTimeBindable = new Bindable(0);

  override get requiresChildrenUpdate(): boolean {
    return true;
  }

  override get isPresent(): boolean {
    return super.isPresent || this.isIdle;
  }

  get isIdle() {
    return this.clock !== null && this.clock.currentTime >= this.lifetimeStart;
  }

  @resolved(IPooledHitObjectProvider)
  protected pooledObjectProvider!: IPooledHitObjectProvider;

  isInitialized = false;

  constructor(initialHitObject?: HitObject) {
    super();

    if (initialHitObject)
      this.entry = new SyntheticHitObjectEntry(initialHitObject);
  }

  protected loadComplete() {
    super.loadComplete();

    this.comboIndexBindable.valueChanged.addListener(() => this.updateComboColor());

    this.updateState();
  }

  applyHitObject(hitObject: HitObject) {
    super.apply(new SyntheticHitObjectEntry(hitObject));
  }

  protected onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    if (entry instanceof SyntheticHitObjectEntry)
      this.lifetimeStart = this.hitObject!.startTime - this.initialLifetimeOffset;

    for (const h of this.hitObject!.nestedHitObjects) {
      const pooledDrawableNested = this.getNestedHitObject(h)
        ?? this.pooledObjectProvider?.getPooledDrawableRepresentation(h, this);

      const drawableNested = pooledDrawableNested ?? this.createNestedHitObject(h);
      if (!drawableNested)
        throw new Error(`createNestedHitObject returned null for ${h.constructor.name}.`);

      if (pooledDrawableNested == null)
        this.onNestedDrawableCreated.emit(drawableNested);

      // drawableNested.onNewResult.addListener(this.onNewResult);
      // drawableNested.onRevertResult.addListener(this.onNestedRevertResult);
      // drawableNested.applyCustomUpdateState.addListener(this.onApplyCustomUpdateState);

      drawableNested.parentHitObject = this;

      this.#nestedHitObjects.push(drawableNested);

      if (drawableNested.entry instanceof SyntheticHitObjectEntry)
        this.entry!.nestedEntries.push(drawableNested.entry);

      this.addNestedHitObject(drawableNested);
    }

    this.startTimeBindable.bindTo(this.hitObject!.startTimeBindable);

    if (hasComboInformation(this.hitObject)) {
      this.comboIndexBindable.bindTo(this.hitObject.comboIndexBindable);
    }

    this.hitObject!.defaultsApplied.addListener(this.#onDefaultsApplied);

    this.onApplied();
    this.hitObjectApplied.emit(this);

    if (this.isLoaded) {
      this.updateState();

      this.updateComboColor();
    }
  }

  protected getNestedHitObject(hitObject: HitObject): DrawableHitObject | null {
    return null;
  }

  protected override loadAsyncComplete() {
    super.loadAsyncComplete();

    this.#skinChanged();
  }

  #skinChanged() {
    this.updateComboColor();
  }

  protected onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    this.startTimeBindable.unbindFrom(this.hitObject!.startTimeBindable);

    if (hasComboInformation(this.hitObject)) {
      this.comboIndexBindable.unbindFrom(this.hitObject.comboIndexBindable);
    }

    this.#nestedHitObjects.length = 0;

    entry.nestedEntries = entry.nestedEntries.filter(nestedEntry => !(nestedEntry instanceof SyntheticHitObjectEntry));

    this.clearNestedHitObjects();

    this.hitObject!.defaultsApplied.removeListener(this.#onDefaultsApplied);

    this.onFreed();

    this.parentHitObject = null;

    this.#clearExistingStateTransforms();
  }

  protected onApplied() {
  }

  protected onFreed() {
  }

  #onDefaultsApplied = () => {
    this.apply(this.entry!);

    this.defaultsApplied.emit(this);
  };

  protected addNestedHitObject(hitObject: DrawableHitObject) {
  }

  protected clearNestedHitObjects() {
  }

  protected createNestedHitObject(hitObject: HitObject): DrawableHitObject | null {
    return null;
  }

  protected override clearInternal() {
    throw new Error(
      `Should never clear a DrawableHitObject as the base implementation adds components. If attempting to use internalChild or internalChildren, using addInternal or addRangeInternal instead.`,
    );
  }

  protected updateState() {
    this.lifetimeEnd = Number.MAX_VALUE;

    this.#clearExistingStateTransforms();

    const initialTransformsTime = this.hitObject!.startTime - this.initialLifetimeOffset;

    this.animationStartTime.value = initialTransformsTime;

    this.absoluteSequence({ time: initialTransformsTime, recursive: true }, () => this.updateInitialTransforms());
    this.absoluteSequence({ time: this.hitObject!.startTime, recursive: true }, () => this.updateStartTimeTransforms());
    this.absoluteSequence({ time: this.hitObject!.endTime, recursive: true }, () => this.updateEndTimeTransforms());

    if (this.lifetimeEnd === Number.MAX_VALUE)
      this.lifetimeEnd = Math.max(this.latestTransformEndTime, this.hitObject!.endTime);

    this.applyCustomUpdateState.emit(this);

    this.updateComboColor();
  }

  applyCustomUpdateState = new Action<DrawableHitObject>();

  #clearExistingStateTransforms() {
    super.applyTransformsAt(Number.MIN_VALUE, true);

    super.clearTransformsAfter(Number.MIN_VALUE, true);
  }

  refreshTransforms() {
    this.updateState();
  };

  protected updateInitialTransforms() {
    this.fadeInFromZero();
  }

  protected updateStartTimeTransforms() {
  }

  protected updateEndTimeTransforms() {
  }

  override clearTransformsAfter() {
  }

  override applyTransformsAt() {
  }

  protected get initialLifetimeOffset() {
    return 10000;
  }

  get stateUpdateTime() {
    return this.hitObject!.startTime;
  }

  onKilled() {
    for (const h of this.nestedHitObjects)
      h.onKilled();

    this.updateResult();
  }

  protected updateResult() {
  }

  @resolved(Beatmap)
  protected beatmap!: Beatmap;

  protected updateComboColor() {
    this.accentColor.value = this.beatmap.colors.getComboColor(this.comboIndexBindable.value);
  }

  readonly animationStartTime = new Bindable(0);
}
