import type { DependencyContainer, ReadonlyBindable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { HitObject } from '../HitObject';
import type { HitObjectJudge } from './HitObjectJudge';
import type { HitObjectLifetimeEntry } from './HitObjectLifetimeEntry';
import { Action, Bindable, dependencyLoader, resolved, Vec2 } from 'osucad-framework';
import { Color } from 'pixi.js';
import { IBeatmap } from '../../beatmap/IBeatmap';
import { PoolableDrawableWithLifetime } from '../../pooling/PoolableDrawableWithLifetime';
import { IAnimationTimeReference } from '../../skinning/IAnimationTimeReference';
import { ISkinSource } from '../../skinning/ISkinSource';
import { HitResult } from '../HitResult';
import { hasComboInformation } from '../IHasComboInformation';
import { JudgementResult } from '../JudgementResult';
import { ArmedState } from './ArmedState';
import { IHitObjectJudgeProvider } from './HitObjectJudge';
import { IPooledHitObjectProvider } from './IPooledHitObjectProvider';
import { SyntheticHitObjectEntry } from './SyntheticHitObjectEntry';

export class DrawableHitObject extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry> implements IAnimationTimeReference {
  defaultsApplied = new Action<DrawableHitObject>();

  hitObjectApplied = new Action<DrawableHitObject>();

  onNewResult = new Action<[DrawableHitObject, JudgementResult]>();

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.#dependencies.provide(DrawableHitObject, this);
    this.#dependencies.provide(IAnimationTimeReference, this);
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

  override updateAfterChildren() {
    super.updateAfterChildren();

    this.updateResult(false);
  }

  protected updateResult(userTriggered: boolean): boolean {
    if (this.judged)
      return false;

    if (this.judge)
      this.judge.checkForResult(this, userTriggered, this.time.current - this.hitObject!.endTime);
    else
      this.checkForResult(userTriggered, this.time.current - this.hitObject!.endTime);

    return this.judged;
  }

  protected applyResult(apply: (result: JudgementResult, hitObject: this) => void) {
    const result = new JudgementResult(HitResult.None, this.time.current, this.time.current - this.hitObject!.endTime, new Vec2());
    apply(result, this);

    this.#result = result;

    this.updateState(result.isHit ? ArmedState.Hit : ArmedState.Miss);

    this.onNewResult.emit([this, result]);
  }

  protected checkForResult(userTriggered: boolean, timeOffset: number) {
  }

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

  @resolved(IHitObjectJudgeProvider)
  protected judgeProvider!: IHitObjectJudgeProvider;

  isInitialized = false;

  judge!: HitObjectJudge | null;

  constructor(initialHitObject?: HitObject) {
    super();

    if (initialHitObject)
      this.entry = new SyntheticHitObjectEntry(initialHitObject);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.comboIndexBindable.valueChanged.addListener(() => this.updateComboColor());

    this.#updateStateFromResult();
  }

  applyHitObject(hitObject: HitObject) {
    super.apply(new SyntheticHitObjectEntry(hitObject));
  }

  protected override onApply(entry: HitObjectLifetimeEntry) {
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

      drawableNested.onNewResult.addListener(this.#onNewResult, this);
      // drawableNested.onRevertResult.addListener(this.onNestedRevertResult);
      // drawableNested.applyCustomUpdateState.addListener(this.#onApplyCustomUpdateState, this);

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

    this.judge = this.judgeProvider.getJudge(this);
    if (this.judge)
      this.addInternal(this.judge);

    if (this.isLoaded) {
      this.#updateStateFromResult();

      this.updateComboColor();
    }
  }

  suppressHitSounds = false;

  protected playSamples() {}

  #onNewResult([hitObject, result]: [DrawableHitObject, JudgementResult]) {
    this.onNewResult.emit([hitObject, result]);
  };

  protected getNestedHitObject(hitObject: HitObject): DrawableHitObject | null {
    return null;
  }

  protected override loadAsyncComplete() {
    super.loadAsyncComplete();

    this.#skinChanged();
  }

  @resolved(ISkinSource)
  protected currentSkin!: ISkinSource;

  #skinChanged() {
    this.updateComboColor();
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    this.startTimeBindable.unbindFrom(this.hitObject!.startTimeBindable);

    if (hasComboInformation(this.hitObject)) {
      this.comboIndexBindable.unbindFrom(this.hitObject.comboIndexBindable);
    }

    for (const h of this.nestedHitObjects) {
      h.onNewResult.removeListener(this.#onNewResult, this);
    }

    this.#nestedHitObjects.length = 0;

    entry.nestedEntries = entry.nestedEntries.filter(nestedEntry => !(nestedEntry instanceof SyntheticHitObjectEntry));

    this.clearNestedHitObjects();

    this.hitObject!.defaultsApplied.removeListener(this.#onDefaultsApplied);

    this.onFreed();

    this.parentHitObject = null;

    if (this.judge)
      this.removeInternal(this.judge);
    this.judge = null;

    this.#result = null;

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

  #result: JudgementResult | null = null;

  get result() {
    return this.#result;
  }

  get judged() {
    return this.result !== null;
  }

  get allJudged() {
    return this.judged && this.nestedHitObjects.every(h => h.judged);
  }

  get isHit() {
    return this.result?.isHit ?? false;
  }

  #updateStateFromResult() {
    if (this.result?.isHit || this.alwaysHit)
      this.updateState(ArmedState.Hit, true);
    else if (this.result)
      this.updateState(ArmedState.Miss, true);
    else
      this.updateState(ArmedState.Idle, true);
  }

  #state = new Bindable(ArmedState.Idle);

  get state() {
    return this.#state as ReadonlyBindable<ArmedState>;
  }

  protected updateState(newState: ArmedState, force = false) {
    if (this.state.value === newState && !force)
      return;

    this.lifetimeEnd = Number.MAX_VALUE;

    this.#clearExistingStateTransforms();

    const initialTransformsTime = this.hitObject!.startTime - this.initialLifetimeOffset;

    this.animationStartTime.value = initialTransformsTime;

    this.absoluteSequence({ time: initialTransformsTime, recursive: true }, () => this.updateInitialTransforms());
    this.absoluteSequence({ time: this.stateUpdateTime, recursive: true }, () => this.updateStartTimeTransforms());
    this.absoluteSequence({ time: this.hitStateUpdateTime, recursive: true }, () => this.updateHitStateTransforms(newState));

    this.#state.value = newState;

    if (this.lifetimeEnd === Number.MAX_VALUE)
      this.lifetimeEnd = Math.max(this.latestTransformEndTime, this.hitObject!.endTime);

    this.applyCustomUpdateState.emit(this);

    if (!this.suppressHitSounds && newState === ArmedState.Hit && !force)
      this.playSamples();

    this.updateComboColor();
  }

  applyCustomUpdateState = new Action<DrawableHitObject>();

  #onApplyCustomUpdateState(drawable: DrawableHitObject) {
    this.applyCustomUpdateState.emit(drawable);
  }

  #clearExistingStateTransforms() {
    super.applyTransformsAt(-Number.MAX_VALUE, true);

    super.clearTransformsAfter(-Number.MAX_VALUE, true);
  }

  refreshTransforms() {
    this.updateState(this.state.value, true);
  };

  protected updateInitialTransforms() {
    this.fadeInFromZero();
  }

  protected updateStartTimeTransforms() {
  }

  protected updateHitStateTransforms(state: ArmedState) {
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

  alwaysHit = false;

  get hitStateUpdateTime() {
    if (this.alwaysHit)
      return this.hitObject!.endTime;
    return this.result?.absoluteTime ?? this.hitObject!.endTime;
  }

  onKilled() {
    for (const h of this.nestedHitObjects)
      h.onKilled();

    this.updateResult(false);
  }

  @resolved(IBeatmap)
  protected beatmap!: IBeatmap;

  protected updateComboColor() {
    if (!hasComboInformation(this.hitObject))
      return;

    this.accentColor.value = this.hitObject.getComboColor(this.currentSkin);
  }

  readonly animationStartTime = new Bindable(0);
}
