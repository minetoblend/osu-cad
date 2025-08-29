import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Action, Bindable, provideSelf, resolved } from "@osucad/framework";
import { Color } from "pixi.js";
import { PoolableDrawableWithLifetime } from "../../../pooling/PoolableDrawableWithLifetime";
import type { IAnimationTimeReference } from "../../../skinning/IAnimationTimeReference";
import type { HitObject } from "../HitObject";
import { ArmedState } from "./ArmedState";
import type { HitObjectLifetimeEntry } from "./HitObjectLifetimeEntry";
import { SyntheticHitObjectEntry } from "./SyntheticHitObjectEntry";
import { ISkinSource } from "../../../skinning/ISkinSource";
import { IPooledHitObjectProvider } from "../../ui/IPooledHitObjectProvider";
import type { HitSampleInfo } from "../../../audio/HitSampleInfo";
import { JudgementResult } from "../../judgements/JudgementResult";
import type { Judgement } from "../../judgements/Judgement";
import type { HitResult } from "../../scoring/HitResult";
import { SkinnableSound } from "../../../skinning/SkinnableSound";

@provideSelf()
export class DrawableHitObject<out T extends HitObject = HitObject>
  extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry>
  implements IAnimationTimeReference
{
  public readonly defaultsApplied = new Action<DrawableHitObject>();

  public readonly hitObjectApplied = new Action<DrawableHitObject>();

  public get hitObject(): T
  {
    return this.entry?.hitObject as T;
  }

  public parentHitObject: DrawableHitObject | null = null;

  public readonly accentColor = new Bindable(new Color(0xffffff));

  protected samples!: SkinnableSound;

  #samplesLoaded = false;

  protected getSamples()
  {
    return this.samplesBindable.value;
  }

  public readonly animationStartTime = new Bindable(0);

  public readonly onNewResult = new Action<[DrawableHitObject, JudgementResult]>();

  public readonly onRevertResult = new Action<[DrawableHitObject, JudgementResult]>();

  readonly #state = new Bindable(ArmedState.Idle);

  public isInitialized = false;

  public get state()
  {
    return this.#state.value;
  }

  public set state(value)
  {
    this.updateState(value);
  }

  public constructor(initialHitObject?: T)
  {
    super();

    if (initialHitObject)
    {
      this.entry = new SyntheticHitObjectEntry(initialHitObject);
      this.#ensureEntryHasResult();
    }
  }

  @resolved(ISkinSource)
  protected accessor skin!: ISkinSource;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    super.addInternal(this.samples = new SkinnableSound().adjust(t => t.minimumSampleVolume = 5));
  }

  protected override loadAsyncComplete(): void
  {
    super.loadAsyncComplete();
    this.skinChanged();
  }

  public handleUserInput = true;

  public override get propagatePositionalInputSubTree(): boolean
  {
    return this.handleUserInput;
  }

  public override get propagateNonPositionalInputSubTree(): boolean
  {
    return this.handleUserInput;
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.skin.sourceChanged.addListener(this.skinChanged, this);

    this.samplesBindable.bindValueChanged(() =>
    {
      if (this.#samplesLoaded)
        this.loadSamples();
    });

    this.#updateStateFromResult();
  }

  public readonly applyCustomUpdateState = new Action<[DrawableHitObject, ArmedState]>();

  public readonly startTimeBindable = new Bindable(0);

  public readonly samplesBindable = new Bindable<HitSampleInfo[]>([]);

  public get hitStateUpdateTime()
  {
    if (this.autoMode)
      return this.hitObject.endTime;

    return this.result?.timeAbsolute ?? this.hitObject.endTime;
  }

  public get result()
  {
    return this.entry?.result ?? null;
  }

  public get isHit()
  {
    return this.result?.isHit ?? false;
  }

  public get judged()
  {
    return this.entry?.judged ?? false;
  }

  public get allJudged()
  {
    return this.entry?.allJudged ?? false;
  }

  public override get requiresChildrenUpdate(): boolean
  {
    return true;
  }

  public override get isPresent(): boolean
  {
    return super.isPresent || this.isIdle;
  }

  public get isIdle()
  {
    return this.clock !== null && this.clock.currentTime >= this.lifetimeStart;
  }

  @resolved(IPooledHitObjectProvider, true)
  accessor #pooledObjectProvider!: IPooledHitObjectProvider | undefined;

  public readonly onNestedDrawableCreated = new Action<DrawableHitObject>();

  #nestedHitObjects: DrawableHitObject[] = [];

  public get nestedHitObjects()
  {
    return this.#nestedHitObjects as readonly DrawableHitObject[];
  }

  protected override onApply(entry: HitObjectLifetimeEntry)
  {
    super.onApply(entry);

    if (entry instanceof SyntheticHitObjectEntry)
      this.lifetimeStart = entry.lifetimeStart - this.initialLifetimeOffset;

    this.#ensureEntryHasResult();

    entry.revertResult.addListener(this.#onRevertResult, this);

    for (const h of this.hitObject.nestedHitObjects)
    {
      const pooledDrawableNested = this.#pooledObjectProvider?.getPooledDrawableRepresentation(h, this);

      const drawableNested = pooledDrawableNested ?? this.createNestedHitObject(h);

      if (!drawableNested)
        throw new Error(`createNestedHitObject returned null for ${h.constructor.name}.`);

      if (pooledDrawableNested === null)
        this.onNestedDrawableCreated.emit(drawableNested);

      drawableNested.onNewResult.addListener(this.#onNewResult, this);
      drawableNested.onRevertResult.addListener(this.#onNestedRevertResult, this);
      drawableNested.applyCustomUpdateState.addListener(this.#onApplyCustomUpdateState, this);

      drawableNested.parentHitObject = this;

      this.#nestedHitObjects.push(drawableNested);

      if (drawableNested.entry instanceof SyntheticHitObjectEntry)
        entry.nestedEntries.add(drawableNested.entry);

      this.addNestedHitObject(drawableNested);
    }

    this.startTimeBindable.bindTo(this.hitObject.startTimeBindable);

    this.samplesBindable.bindTo(this.hitObject.samplesBindable);
    this.hitObject.defaultsApplied.addListener(this.#onDefaultsApplied, this);

    this.onApplied();
    this.hitObjectApplied.emit(this);

    if (this.isLoaded)
    {
      this.#updateStateFromResult();
      this.updateComboColor();
    }
  }

  protected override onFree(entry: HitObjectLifetimeEntry)
  {
    super.onFree(entry);

    this.startTimeBindable.unbindFrom(this.hitObject.startTimeBindable);

    this.samplesBindable.unbindFrom(this.hitObject.samplesBindable);

    this.#samplesLoaded = false;
    this.samples?.clearSamples();

    for (const obj of this.#nestedHitObjects)
    {
      obj.applyCustomUpdateState.removeListener(this.#onApplyCustomUpdateState, this);
      obj.onNewResult.removeListener(this.#onNewResult, this);
      obj.onRevertResult.removeListener(this.#onNestedRevertResult, this);
    }
    this.#nestedHitObjects = [];

    for (const nestedEntry of [...entry.nestedEntries])
    {
      if (nestedEntry instanceof SyntheticHitObjectEntry)
        entry.nestedEntries.delete(nestedEntry);
    }
    this.clearNestedHitObjects();
    this.hitObject.defaultsApplied.removeListener(this.#onDefaultsApplied, this);

    entry.revertResult.removeListener(this.#onRevertResult, this);

    this.onFreed();

    this.parentHitObject = null;

    this.#clearExistingStateTransforms();
  }

  protected onApplied()
  {
  }

  protected onFreed()
  {
  }

  protected loadSamples()
  {
    const samples = this.getSamples();

    if (samples.length <= 0)
      return;

    this.samples.samples = [...samples];
  }

  #onNewResult(drawableHitObject: DrawableHitObject, result: JudgementResult)
  {
    this.onNewResult.emit(drawableHitObject, result);
  }

  #onRevertResult()
  {
    this.updateState(ArmedState.Idle);
    this.onRevertResult.emit(this, this.result!);
  }

  #onNestedRevertResult(drawableHitObject: DrawableHitObject, result: JudgementResult)
  {
    this.onRevertResult.emit(drawableHitObject, result);
  }

  #onDefaultsApplied(hitObject: HitObject)
  {
    console.assert(this.entry !== null);
    this.apply(this.entry!);

    this.defaultsApplied.emit(this);
  }

  protected createNestedHitObject(hitObject: HitObject): DrawableHitObject | null
  {
    return null;
  }

  protected addNestedHitObject(hitObject: DrawableHitObject)
  {
  }

  protected clearNestedHitObjects()
  {
  }

  #onApplyCustomUpdateState(drawableHitObject: DrawableHitObject, state: ArmedState)
  {
    this.applyCustomUpdateState.emit(drawableHitObject, state);
  }

  public updateState(state: ArmedState, force = false)
  {
    if (state === this.state && !force)
      return;

    this.#state.value = state;

    this.lifetimeEnd = Number.MAX_VALUE;

    this.#clearExistingStateTransforms();

    const initialTransformsTime = this.hitObject!.startTime - this.initialLifetimeOffset;

    this.animationStartTime.value = initialTransformsTime;

    this.absoluteSequence(initialTransformsTime, () => this.updateInitialTransforms());
    this.absoluteSequence(this.hitObject.startTime, () => this.updateStartTimeTransforms());
    this.absoluteSequence(this.hitStateUpdateTime, () => this.updateHitStateTransforms(state));

    if (this.lifetimeEnd === Number.MAX_VALUE)
      this.lifetimeEnd = Math.max(this.latestTransformEndTime, this.hitObject!.endTime);

    this.applyCustomUpdateState.emit(this, state);
    if (!force && state === ArmedState.Hit)
      this.playSamples();
  }

  #clearExistingStateTransforms()
  {
    super.applyTransformsAt(-Number.MAX_VALUE, true);

    super.clearTransformsAfter(-Number.MAX_VALUE, true);
  }

  public override clearTransformsAfter()
  {
  }

  public override applyTransformsAt()
  {
  }

  protected override update()
  {
    if (!this.#samplesLoaded)
    {
      this.#samplesLoaded = true;
      this.loadSamples();
    }

    super.update();
  }

  protected override updateAfterChildren()
  {
    super.updateAfterChildren();

    this.updateResult(false);
  }

  protected get initialLifetimeOffset()
  {
    return 1000;
  }

  protected updateInitialTransforms()
  {
    this.fadeInFromZero();
  }

  protected updateStartTimeTransforms()
  {
  }

  protected updateHitStateTransforms(state: ArmedState)
  {
  }

  public onKilled()
  {
    for (const nested of this.nestedHitObjects)
      nested.onKilled();

    this.updateResult(false);
  }

  protected updateComboColor()
  {
  }

  protected skinChanged()
  {
    this.updateComboColor();
  }

  public override dispose()
  {
    this.skin.sourceChanged.removeListener(this.skinChanged, this);

    super.dispose();
  }

  protected playSamples()
  {
    this.samples?.play();
  }

  public stopAllSamples()
  {
    if (this.samples?.looping === true)
      this.samples.stop();
  }

  protected applyMaxResult()
  {
    this.applyResult(r => r.type = r.judgement.maxResult);
  }

  protected applyMinResult()
  {
    this.applyResult(r => r.type = r.judgement.minResult);
  }

  protected applyResult(type: HitResult): void;
  protected applyResult(application: (result: JudgementResult) => void): void;
  protected applyResult(application: ((result: JudgementResult) => void) | HitResult)
  {
    if (typeof application !== "function")
    {
      this.applyResult(result => result.type = application);
      return;
    }

    const result = this.result!;

    if (result.hasResult)
      throw new Error("Cannot apply result on a hitobject that already has a result.");

    application(result);

    if (!result.hasResult)
      throw new Error(`${this.constructor.name} applied a JudgementResult but did not update JudgementResult.Type.`);

    result.rawTime = this.time.current;

    if (result.hasResult)
      this.updateState(result.isHit ? ArmedState.Hit : ArmedState.Miss);

    this.onNewResult.emit(this, result);
  }

  public autoMode = false;

  protected updateResult(userTriggered: boolean)
  {
    // TODO:
    // if ((Clock as IGameplayClock)?.IsRewinding == true)
    //                 return false;

    if (this.judged)
      return false;

    if (this.autoMode)
    {
      if (this.time.current - this.hitObject.endTime > 0)
        this.applyMaxResult();
      return;
    }

    this.checkForResult(userTriggered, this.time.current - this.hitObject.endTime);

    return this.judged;
  }

  protected checkForResult(userTriggered: boolean, timeOffset: number)
  {
  }

  protected createResult(judgement: Judgement): JudgementResult
  {
    return new JudgementResult(this.hitObject, judgement);
  }

  #ensureEntryHasResult()
  {
    this.entry!.result ??= this.createResult(this.hitObject.judgement);
  }

  #updateStateFromResult()
  {
    if (this.result!.isHit)
      this.updateState(ArmedState.Hit, true);
    else if (this.result!.hasResult)
      this.updateState(ArmedState.Miss, true);
    else
      this.updateState(ArmedState.Idle, true);
  }
}
