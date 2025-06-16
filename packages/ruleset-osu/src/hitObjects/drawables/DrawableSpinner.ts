import type { ArmedState, DrawableHitObject, HitObject, Judgement, JudgementResult } from "@osucad/core";
import { SampleInfo, SkinnableSound } from "@osucad/core";
import { AspectContainer, HitResult, SkinnableDrawable } from "@osucad/core";
import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import type { Spinner } from "../Spinner";
import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import type { ValueChangedEvent } from "@osucad/framework";
import { Anchor, Axes, Bindable, clamp, Container, type ReadonlyDependencyContainer } from "@osucad/framework";
import { SpinnerRotationTracker } from "./SpinnerRotationTracker";
import { OsuAction } from "../../ui/OsuAction";
import { SpinnerSpmCalculator } from "../../skinning/legacy/SpinnerSpmCalculator";
import { OsuSpinnerJudgementResult } from "../../judgements/OsuSpinnerJudgementResult";
import { DrawableSpinnerBonusTick } from "./DrawableSpinnerBonusTick";
import { SpinnerTick } from "../SpinnerTick";
import { OsuSpinnerBonusTickJudgement, SpinnerBonusTick } from "../SpinnerBonusTick";
import { DrawableSpinnerTick } from "./DrawableSpinnerTick";
import { OsuScoreProcessor } from "../../scoring/OsuScoreProcessor";

const fade_out_duration = 240;
const score_per_tick =  new OsuScoreProcessor().getBaseScoreForResult(new OsuSpinnerBonusTickJudgement().maxResult);
const spinning_sample_modulated_base_frequency = 0.5;

export class DrawableSpinner extends DrawableOsuHitObject<Spinner>
{

  constructor(initialHitObject?: Spinner)
  {
    super(initialHitObject);
  }

  public body!: SkinnableDrawable;

  public rotationTracker!: SpinnerRotationTracker; // TODO

  #spmCalculator!: SpinnerSpmCalculator;

  #ticks!: Container<DrawableSpinnerTick>;

  isSpinning!: Bindable<boolean>;

  #spinningSample!: SkinnableSound;
  #maxBonusSample!: SkinnableSound;

  get currentBonusScore()
  {
    return score_per_tick * clamp(this.completedFullSpins.value - this.hitObject.spinsRequiredForBonus, 0, this.hitObject.maximumBonusSpins);
  }

  get maximumBonusScore()
  {
    return score_per_tick * this.hitObject.maximumBonusSpins;
  }

  public readonly completedFullSpins = new Bindable(0);
  public readonly spinsPerMinute = new Bindable(0);

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.origin = Anchor.Center;
    this.relativeSizeAxes = Axes.Both;

    this.addRangeInternal([
      this.#spmCalculator = new SpinnerSpmCalculator(),
      this.#ticks = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      new AspectContainer({
        anchor: Anchor.Center,
        origin: Anchor.Center,
        relativeSizeAxes: Axes.Y,
        children: [
          this.body = new SkinnableDrawable(OsuSkinComponents.SpinnerBody),
          this.rotationTracker = new SpinnerRotationTracker(this),
        ],
      }),
      this.#spinningSample = new SkinnableSound().adjust(it =>
      {
        it.looping = true;
        it.minimumSampleVolume = 5;
      }),
      this.#maxBonusSample = new SkinnableSound().adjust(it => it.minimumSampleVolume = 5),
    ]);

    this.spinsPerMinute.bindTo(this.#spmCalculator.result);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.isSpinning = this.rotationTracker.isSpinning.getBoundCopy();
    this.isSpinning.bindValueChanged(this.#updateSpinningSample, this);
  }

  protected override addNestedHitObject(hitObject: DrawableHitObject)
  {
    super.addNestedHitObject(hitObject);

    if (hitObject instanceof DrawableSpinnerTick)
    {
      this.#ticks.add(hitObject);
    }
  }

  protected override updateHitStateTransforms(state: ArmedState)
  {
    super.updateHitStateTransforms(state);

    this.fadeOut(fade_out_duration);
    this.expire();
  }

  protected override clearNestedHitObjects()
  {
    super.clearNestedHitObjects();

    this.#ticks.clear();
  }

  protected override createNestedHitObject(hitObject: HitObject): DrawableHitObject | null
  {

    if (hitObject instanceof SpinnerBonusTick)
      return new DrawableSpinnerBonusTick(hitObject);

    if (hitObject instanceof SpinnerTick)
      return new DrawableSpinnerTick(hitObject);

    return super.createNestedHitObject(hitObject);
  }

  #isCorrectButtonPressed()
  {
    if (!this.osuActionInputManager)
      return false;

    for (const action of this.osuActionInputManager.pressedActions)
    {
      if (action === OsuAction.LeftButton || action === OsuAction.RightButton)
        return true;
    }

    return false;
  }

  override update()
  {
    super.update();

    this.#spinningSample.rate.value = spinning_sample_modulated_base_frequency + this.progress;

    if (this.handleUserInput)
      this.rotationTracker.tracking = this.rotationTracker.isSpinnableTime && this.#isCorrectButtonPressed() && !this.allJudged;

    let nextTick: DrawableHitObject | null = null;

    for (const nested of this.nestedHitObjects)
    {
      if (!nested.judged)
      {
        nextTick = nested;
        break;
      }
    }

    if (nextTick?.lifetimeStart === Number.MAX_VALUE)
      nextTick.lifetimeStart = this.hitObject.startTime;
  }

  override updateAfterChildren()
  {
    super.updateAfterChildren();

    if (this.result.timeStarted === undefined && this.rotationTracker.tracking)
      this.result.timeStarted = this.time.current;

    if (this.time.current < this.hitObject.endTime)
      this.#spmCalculator.setRotation(this.result.totalRotation);

    this.#updateBonusScore();
  }

  #updateBonusScore()
  {
    if (this.#ticks.children.length === 0)
      return;

    const spins = Math.floor(this.result.totalRotation / 360);

    if (spins < this.completedFullSpins.value)
    {
      // rewinding, silently handle
      this.completedFullSpins.value = spins;
      return;
    }

    while (this.completedFullSpins.value !== spins)
    {
      const tick = this.#ticks.children.find(t => !t.result?.hasResult);

      // tick may be null if we've hit the spin limit.
      if (tick === undefined)
      {
        // TODO
        // maxBonusSample.Play();
      }
      else
      {
        tick.triggerResult(true);
      }

      this.completedFullSpins.value++;
    }
  }

  protected override updatePosition(): void
  {
    this.position = this.positionBindable.value;
  }

  protected override updateScale(): void
  {
  }

  get progress(): number
  {
    if (this.hitObject.spinsRequired === 0)
      return 1;

    return clamp(this.result.totalRotation / 360 / this.hitObject.spinsRequired, 0, 1);
  }

  protected override createResult(judgement: Judgement): JudgementResult
  {
    return new OsuSpinnerJudgementResult(this.hitObject, judgement);
  }

  override get result(): OsuSpinnerJudgementResult
  {
    return super.result as OsuSpinnerJudgementResult;
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number)
  {
    if (this.time.current < this.hitObject.startTime)
      return;

    if (this.progress >= 1)
      this.result.timeCompleted ??= this.time.current;

    if (userTriggered || this.time.current < this.hitObject.endTime)
      return;

    // Trigger a miss result for remaining ticks to avoid infinite gameplay.
    for (const tick of this.#ticks.children.filter(t => !t.result!.hasResult))
      tick.triggerResult(false);

    this.applyResult(r =>
    {
      if (this.progress >= 1)
        r.type = HitResult.Great;
      else if (this.progress > .9)
        r.type = HitResult.Ok;
      else if (this.progress > .75)
        r.type = HitResult.Meh;
      else if (this.time.current >= this.hitObject.endTime)
        r.type = r.judgement.minResult;
    });
  }

  protected override onFreed()
  {
    super.onFreed();

    this.#spinningSample.clearSamples();
    this.#maxBonusSample.clearSamples();
  }

  protected override loadSamples()
  {
    super.loadSamples();

    this.#spinningSample.samples = this.hitObject.createSpinningSamples();
    this.#maxBonusSample.samples = [new SampleInfo("spinnerbonus-max")];
  }

  #updateSpinningSample(tracking: ValueChangedEvent<boolean>)
  {
    if (tracking.value)
    {
      if (!this.#spinningSample.isPlaying)
      {
        this.#spinningSample.play();
      }
    }
    else if(this.#spinningSample.isPlaying)
      this.#spinningSample.stop();
  }
}
