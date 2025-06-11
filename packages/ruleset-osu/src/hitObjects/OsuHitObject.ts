import type { HitSoundInfo, HitWindows, Judgement } from "@osucad/core";
import { BeatmapDifficultyInfo, HitObject, type IBeatmapTiming, safeAssign } from "@osucad/core";
import type { IVec2 } from "@osucad/framework";
import { Bindable, BindableBoolean, BindableNumber, Vec2 } from "@osucad/framework";
import { OsuHitWindows } from "../scoring/OsuHitWindows";
import { OsuJudgement } from "../judgements/OsuJudgement";

export interface OsuHitObjectOptions
{
  startTime?: number;
  position?: IVec2;
  x?: number;
  y?: number;
  newCombo?: boolean;
  comboOffset?: number;
  stackHeight?: number;
  hitSound?: HitSoundInfo
}

export abstract class OsuHitObject extends HitObject
{
  static readonly OBJECT_RADIUS = 64;

  static readonly OBJECT_DIMENSIONS = new Vec2(OsuHitObject.OBJECT_RADIUS * 2);

  static readonly BASE_SCORING_DISTANCE = 100;

  static readonly PREEMPT_MIN = 450;

  static readonly PREEMPT_MID = 1200;

  static readonly PREEMPT_MAX = 1800;

  protected constructor(options: OsuHitObjectOptions = {})
  {
    super();

    safeAssign(this, options);
  }

  timePreempt = 600;

  timeFadeIn = 400;

  //#region position
  readonly positionBindable = new Bindable(Vec2.zero());

  get position(): Vec2
  {
    return this.positionBindable.value;
  }

  set position(value: IVec2)
  {
    this.positionBindable.value = Vec2.from(value);
  }

  get x()
  {
    return this.position.x;
  }

  set x(value: number)
  {
    this.position = this.position.withX(value);
  }

  get y()
  {
    return this.position.y;
  }

  set y(value: number)
  {
    this.position = this.position.withY(value);
  }

  //#endregion

  //#region combo
  readonly newComboBindable = new BindableBoolean();

  get newCombo()
  {
    return this.newComboBindable.value;
  }

  set newCombo(value)
  {
    this.newComboBindable.value = value;
  }

  readonly comboOffsetBindable = new BindableNumber(0)
    .withMinValue(0);

  get comboOffset()
  {
    return this.comboOffsetBindable.value;
  }

  set comboOffset(value)
  {
    this.comboOffsetBindable.value = value;
  }

  readonly comboIndexBindable = new Bindable(0);

  get comboIndex()
  {
    return this.comboIndexBindable.value;
  }

  set comboIndex(value)
  {
    this.comboIndexBindable.value = value;
  }

  readonly indexInComboBindable = new Bindable(0);

  get indexInCombo()
  {
    return this.indexInComboBindable.value;
  }

  set indexInCombo(value)
  {
    this.indexInComboBindable.value = value;
  }

  //#endregion

  readonly scaleBindable = new Bindable(1);

  get scale()
  {
    return this.scaleBindable.value;
  }

  protected set scale(value)
  {
    this.scaleBindable.value = value;
  }

  get radius()
  {
    return OsuHitObject.OBJECT_RADIUS * this.scale;
  }

  override applyDefaults(difficulty: BeatmapDifficultyInfo, timing: IBeatmapTiming)
  {
    super.applyDefaults(difficulty, timing);

    for (const h of this.nestedHitObjects)
    {

      if (h instanceof OsuHitObject)
      {
        h.comboIndexBindable.bindTo(this.comboIndexBindable);
        h.indexInComboBindable.bindTo(this.indexInComboBindable);
      }
    }
  }

  protected override applyDefaultsToSelf(difficulty: BeatmapDifficultyInfo, timing: IBeatmapTiming)
  {
    super.applyDefaultsToSelf(difficulty, timing);

    this.timePreempt = BeatmapDifficultyInfo.difficultyRange(difficulty.approachRate, OsuHitObject.PREEMPT_MAX, OsuHitObject.PREEMPT_MID, OsuHitObject.PREEMPT_MIN);

    this.timeFadeIn = 400 * Math.min(1, this.timePreempt / OsuHitObject.PREEMPT_MIN);

    this.scale = difficulty.calculateCircleSize(true);
  }

  // #region stacking
  readonly stackHeightBindable = new Bindable(0);

  get stackHeight()
  {
    return this.stackHeightBindable.value;
  }

  set stackHeight(value)
  {
    this.stackHeightBindable.value = value;
  }

  get stackOffset()
  {
    return new Vec2(this.stackHeight * this.scale * -6.4);
  }

  get stackedPosition()
  {
    return this.position.add(this.stackOffset);
  }

  get endPosition()
  {
    return this.position;
  }

  get stackedEndPosition()
  {
    return this.endPosition.add(this.stackOffset);
  }

  // #endregion

  protected override createHitWindows(): HitWindows
  {
    return new OsuHitWindows();
  }

  override createJudgement(): Judgement
  {
    return new OsuJudgement();
  }
}
