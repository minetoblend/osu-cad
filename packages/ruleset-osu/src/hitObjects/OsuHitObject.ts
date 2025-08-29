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
  position: ["stacking"],
  newCombo: ["combo"],
  comboOffset: ["combo"],
})
export abstract class OsuHitObject extends HitObject
{
  public static readonly OBJECT_RADIUS = 64;

  public static readonly OBJECT_DIMENSIONS = new Vec2(OsuHitObject.OBJECT_RADIUS * 2);

  public static readonly BASE_SCORING_DISTANCE = 100;

  public static readonly PREEMPT_MIN = 450;

  public static readonly PREEMPT_MID = 1200;

  public static readonly PREEMPT_MAX = 1800;

  public constructor(attributes: DDSAttributes, options: OsuHitObjectOptions = {})
  {
    super(attributes);

    safeAssign(this, options);
  }

  public timePreempt = 600;

  public timeFadeIn = 400;

  //#region position
  public readonly positionBindable = new Bindable(Vec2.zero());

  @customType("vec2")
  @bindableBacked("positionBindable")
  public accessor position!: Vec2

  public get x()
  {
    return this.position.x;
  }

  public set x(value: number)
  {
    this.position = this.position.withX(value);
  }

  public get y()
  {
    return this.position.y;
  }

  public set y(value: number)
  {
    this.position = this.position.withY(value);
  }

  public moveBy(x: number, y: number)
  {
    this.position = new Vec2(this.x + x, this.y + y);
  }

  //#endregion

  //#region combo
  public readonly newComboBindable = new BindableBoolean();

  @type("boolean")
  @bindableBacked("newComboBindable")
  public accessor newCombo!: boolean

  public readonly comboOffsetBindable = new BindableNumber(0)
    .withMinValue(0);

  @type("uint8")
  @bindableBacked("comboOffsetBindable")
  public accessor comboOffset!: number


  public readonly comboIndexBindable = new Bindable(0);

  public get comboIndex()
  {
    return this.comboIndexBindable.value;
  }

  public set comboIndex(value)
  {
    this.comboIndexBindable.value = value;
  }

  public comboIndexWithOffsets = 0;

  public lastInCombo = false;

  public readonly indexInComboBindable = new Bindable(0);

  public get indexInCombo()
  {
    return this.indexInComboBindable.value;
  }

  public set indexInCombo(value)
  {
    this.indexInComboBindable.value = value;
  }

  protected isSpinner(): this is Spinner
  {
    return false;
  }

  public updateComboInformation(lastObj?: OsuHitObject)
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

  public readonly scaleBindable = new Bindable(1);

  public get scale()
  {
    return this.scaleBindable.value;
  }

  protected set scale(value)
  {
    this.scaleBindable.value = value;
  }

  public get radius()
  {
    return OsuHitObject.OBJECT_RADIUS * this.scale;
  }

  public override applyDefaults(difficulty: BeatmapDifficultyInfo, controlPoints: ControlPointInfo)
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
  public readonly stackHeightBindable = new Bindable(0);

  public get stackHeight()
  {
    return this.stackHeightBindable.value;
  }

  public set stackHeight(value)
  {
    this.stackHeightBindable.value = value;
  }

  public get stackOffset()
  {
    return new Vec2(this.stackHeight * this.scale * -6.4);
  }

  public get stackedPosition()
  {
    return this.position.add(this.stackOffset);
  }

  public get endPosition()
  {
    return this.position;
  }

  public get stackedEndPosition()
  {
    return this.endPosition.add(this.stackOffset);
  }

  // #endregion

  protected override createHitWindows(): HitWindows
  {
    return new OsuHitWindows();
  }

  public override createJudgement(): Judgement
  {
    return new OsuJudgement();
  }

  public contains(position: Vec2)
  {
    return Vec2.closerThan(this.stackedPosition, position, this.radius);
  }

  public getSnapTargets(): Vec2[]
  {
    return [this.position];
  }
}

