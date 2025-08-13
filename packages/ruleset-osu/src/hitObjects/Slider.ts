import type { BeatmapDifficultyInfo, ControlPointInfo, HitSoundInfo } from "@osucad/core";
import { bindableBacked, HitSampleInfo, HitWindows, invalidations, safeAssign, SampleAdditions, SampleSet, sampleSetToBank } from "@osucad/core";
import { Bindable, BindableNumber, Vec2 } from "@osucad/framework";
import type { OsuHitObjectOptions } from "./OsuHitObject";
import { OsuHitObject } from "./OsuHitObject";
import type { PathPoint } from "./PathPoint";
import { SliderPath } from "./SliderPath";
import { SliderHeadCircle } from "./SliderHeadCircle";
import { SliderTailCircle } from "./SliderTailCircle";
import { SliderRepeat } from "./SliderRepeat";
import { SliderEventGenerator, SliderEventType } from "./SliderEventGenerator";
import { SliderTick } from "./SliderTick";
import { type DDSAttributes, nested, type } from "@osucad/multiplayer-core";
import { SliderVelocityPoint } from "../beatmaps";

export interface SliderOptions extends OsuHitObjectOptions
{
  repeatCount?: number
  expectedDistance?: number
  controlPoints?: readonly PathPoint[]
  nodeSamples?: readonly HitSoundInfo[]
}

@invalidations({
  repeatCount: ["applyDefaults", "stacking"],
  nodeHitSounds: ["applyDefaults"],
})
export class Slider extends OsuHitObject
{
  static readonly attributes: DDSAttributes = {
    type: "@osucad/slider",
    version: 0,
  };

  constructor(options: SliderOptions = {})
  {
    const { repeatCount, expectedDistance, controlPoints, ...rest } = options;
    super(Slider.attributes, rest);

    safeAssign(this, { repeatCount });

    safeAssign(this.path, { expectedDistance, controlPoints });

    this.positionBindable.bindValueChanged(this.#updateNestedPositions, this);
  }

  #updateNestedPositions()
  {
    for (const nested of this.nestedHitObjects)
    {
      if (nested instanceof SliderHeadCircle)
        nested.position = this.position;
      else if (nested instanceof SliderTailCircle)
        nested.position = this.position;
      else if (nested instanceof SliderRepeat)
        nested.position = this.position.add(this.path.positionAt(nested.pathProgress));
      else if (nested instanceof SliderTick)
        nested.position = this.position.add(this.path.positionAt(nested.pathProgress));
    }

    if (this.headCircle)
      this.headCircle.position = this.position;
    if (this.tailCircle)
      this.tailCircle.position = this.endPosition;
  }

  headCircle: SliderHeadCircle | null = null;

  tailCircle: SliderTailCircle | null = null;

  readonly repeatCountBindable = new BindableNumber(0)
    .withMinValue(0)
    .withPrecision(1);


  @type("uint32")
  @bindableBacked("repeatCountBindable")
  accessor repeatCount!: number

  spanCount()
  {
    return this.repeatCount + 1;
  }

  readonly sliderVelocityBindable = new BindableNumber(1)
    .withMinValue(0);

  get velocity()
  {
    return this.sliderVelocityBindable.value;
  }

  private set velocity(value: number)
  {
    this.sliderVelocityBindable.value = value;
  }

  spanDuration()
  {
    return this.path.distance / this.velocity;
  }

  public override get duration(): number
  {
    return this.spanDuration() * this.spanCount();
  }

  #tickDistance = 1;

  get tickDistance()
  {
    return this.#tickDistance;
  }

  readonly nodeHitSoundsBindable = new Bindable<readonly HitSoundInfo[]>([]);

  get nodeHitSounds()
  {
    return this.nodeHitSoundsBindable.value;
  }

  set nodeHitSounds(value)
  {
    this.nodeHitSoundsBindable.value = value;
  }

  protected override applyDefaultsToSelf(difficulty: BeatmapDifficultyInfo, controlPoints: ControlPointInfo)
  {
    super.applyDefaultsToSelf(difficulty, controlPoints);

    const timingPoint = controlPoints.timingPointAt(this.startTime + 1);

    const baseVelocity = Slider.BASE_SCORING_DISTANCE * difficulty.sliderMultiplier / timingPoint.beatLength;

    const velocityPoint = controlPoints.controlPointAt(SliderVelocityPoint, this.startTime + 1);

    const sliderVelocity = velocityPoint?.velocity ?? 1;

    this.velocity = baseVelocity * sliderVelocity;

    const scoringDistance = this.velocity * timingPoint.beatLength;

    this.#tickDistance = scoringDistance / difficulty.sliderTickRate;
  }

  @nested(SliderPath)
  accessor path = new SliderPath();

  spanAt(progress: number)
  {
    return Math.floor(progress * this.spanCount());
  }

  progressAt(progress: number): number
  {
    let p = (progress * this.spanCount()) % 1;
    if (this.spanAt(progress) % 2 === 1)
      p = 1 - p;
    return p;
  }

  curvePositionAt(progress: number, out: Vec2 = new Vec2()): Vec2
  {
    return this.path.positionAt(this.progressAt(progress), out);
  }

  public override get endPosition(): Vec2
  {
    return this.position.add(this.curvePositionAt(1));
  }

  protected override createNestedHitObjects()
  {
    super.createNestedHitObjects();

    for (const e of SliderEventGenerator.generate(this.startTime, this.spanDuration(), this.velocity, this.tickDistance, this.path.distance, this.spanCount()))
    {
      switch (e.type)
      {
      case SliderEventType.Tick:
        this.addNested(new SliderTick({
          spanIndex: e.spanIndex,
          spanStartTime: e.spanStartTime,
          startTime: e.time,
          position: this.position.add(this.path.positionAt(e.pathProgress)),
          pathProgress: e.pathProgress,
          stackHeight: this.stackHeight,
        }));
        break;
      case SliderEventType.Head:
        this.addNested(this.headCircle = new SliderHeadCircle({
          startTime: e.time,
          position: this.position,
          stackHeight: this.stackHeight,
          hitSound: this.nodeHitSounds[0],
        }));
        break;
      case SliderEventType.Tail:
        this.addNested(this.tailCircle = new SliderTailCircle(this, {
          repeatIndex: e.spanIndex,
          startTime: e.time,
          position: this.endPosition,
          stackHeight: this.stackHeight,
          hitSound: this.nodeHitSounds[this.spanCount()],
        }));
        break;
      case SliderEventType.Repeat:
        this.addNested(new SliderRepeat(this, {
          repeatIndex: e.spanIndex,
          startTime: this.startTime + (e.spanIndex + 1) * this.spanDuration(),
          position: this.position.add(this.path.positionAt(e.pathProgress)),
          stackHeight: this.stackHeight,
          pathProgress: e.pathProgress,
          hitSound: this.nodeHitSounds[e.spanIndex + 1],
        }));
        break;
      }
    }
  }

  protected override createHitWindows()
  {
    return HitWindows.Empty;
  }

  protected override createSamples(controlPoints: ControlPointInfo)
  {
    const samplePoint = controlPoints.samplePointAt(this.startTime);

    const sampleSet = this.hitSound.sampleSet !== SampleSet.None ? this.hitSound.sampleSet : samplePoint.sampleSet;
    const additionSampleSet = this.hitSound.additionSampleSet !== SampleSet.None ? this.hitSound.sampleSet : sampleSet;

    const suffix = samplePoint.sampleIndex > 0 ? samplePoint.sampleIndex.toString() : undefined;

    const samples: HitSampleInfo[] = [
      new HitSampleInfo("sliderslide", sampleSetToBank(sampleSet), suffix, samplePoint.volume),
    ];

    if (this.hitSound.additions && SampleAdditions.Whistle)
    {
      samples.push(new HitSampleInfo("sliderwhistle", sampleSetToBank(additionSampleSet), suffix, samplePoint.volume));
    }

    return samples;
  }
}
