import type { ControlPointInfo, HitSoundInfo, HitWindows, Judgement } from "@osucad/core";
import { BeatmapDifficultyInfo, bindableBacked, customType, HitObject, invalidations, safeAssign } from "@osucad/core";
import type { IVec2 } from "@osucad/framework";
import { Bindable, BindableBoolean, BindableNumber, Vec2 } from "@osucad/framework";
import { type DDSAttributes, type } from "@osucad/multiplayer-core";
import { OsuJudgement } from "../judgements/OsuJudgement";
import { OsuHitWindows } from "../scoring/OsuHitWindows";
import type { Spinner } from "./Spinner";

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

@invalidations({
  startTime: ["stacking", "combo"],
  position: ["applyDefaults", "stacking"],
  newCombo: ["combo"],
  comboOffset: ["combo"],
})
export abstract class OsuHitObject extends HitObject
{
  static readonly OBJECT_RADIUS = 64;

  static readonly OBJECT_DIMENSIONS = new Vec2(OsuHitObject.OBJECT_RADIUS * 2);

  static readonly BASE_SCORING_DISTANCE = 100;

  static readonly PREEMPT_MIN = 450;

  static readonly PREEMPT_MID = 1200;

  static readonly PREEMPT_MAX = 1800;

  constructor(attributes: DDSAttributes, options: OsuHitObjectOptions = {})
  {
    super(attributes);

    safeAssign(this, options);
  }

  timePreempt = 600;

  timeFadeIn = 400;

  //#region position
  readonly positionBindable = new Bindable(Vec2.zero());

  @customType("vec2")
  @bindableBacked("positionBindable")
  accessor position!: Vec2

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

  moveBy(x: number, y: number)
  {
    this.position = new Vec2(this.x + x, this.y + y);
  }

  //#endregion

  //#region combo
  readonly newComboBindable = new BindableBoolean();

  @type("boolean")
  @bindableBacked("newComboBindable")
  accessor newCombo!: boolean

  readonly comboOffsetBindable = new BindableNumber(0)
    .withMinValue(0);

  @type("uint8")
  @bindableBacked("comboOffsetBindable")
  accessor comboOffset!: number


  readonly comboIndexBindable = new Bindable(0);

  get comboIndex()
  {
    return this.comboIndexBindable.value;
  }

  set comboIndex(value)
  {
    this.comboIndexBindable.value = value;
  }

  comboIndexWithOffsets = 0;

  lastInCombo = false;

  readonly indexInComboBindable = new Bindable(0);

  get indexInCombo()
  {
    return this.indexInComboBindable.value;
  }

  set indexInCombo(value)
  {
    this.indexInComboBindable.value = value;
  }

  protected isSpinner(): this is Spinner
  {
    return false;
  }

  updateComboInformation(lastObj?: OsuHitObject)
  {
    let index = lastObj?.comboIndex ?? 0;
    let indexWithOffsets = lastObj?.comboIndexWithOffsets ?? 0;
    let inCurrentCombo = lastObj ? lastObj.indexInCombo + 1 : 0;

    this.lastInCombo = false;

    if (!this.isSpinner() && (this.newCombo || lastObj == null || lastObj.isSpinner()))
    {
      inCurrentCombo = 0;
      index++;
      indexWithOffsets += this.comboOffset + 1;

      if (lastObj)
        lastObj.lastInCombo = true;
    }

    this.comboIndex = index;
    this.comboIndexWithOffsets = indexWithOffsets;
    this.indexInCombo = inCurrentCombo;
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

  override applyDefaults(difficulty: BeatmapDifficultyInfo, controlPoints: ControlPointInfo)
  {
    super.applyDefaults(difficulty, controlPoints);

    for (const h of this.nestedHitObjects)
    {

      if (h instanceof OsuHitObject)
      {
        h.comboIndexBindable.bindTo(this.comboIndexBindable);
        h.indexInComboBindable.bindTo(this.indexInComboBindable);
      }
    }
  }

  protected override applyDefaultsToSelf(difficulty: BeatmapDifficultyInfo, controlPoints: ControlPointInfo)
  {
    super.applyDefaultsToSelf(difficulty, controlPoints);

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

  contains(position: Vec2)
  {
    return Vec2.closerThan(this.stackedPosition, position, this.radius);
  }
}

