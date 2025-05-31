import type { ArmedState, DrawableHitObject, HitObject, Judgement, JudgementResult } from "@osucad/core";
import { AspectContainer, SkinnableDrawable } from "@osucad/core";
import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import type { Spinner } from "../Spinner";
import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
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
    ]);

    this.spinsPerMinute.bindTo(this.#spmCalculator.result);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.isSpinning = this.rotationTracker.isSpinning.getBoundCopy();
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
}
