import type { BeatmapDifficultyInfo, ControlPointInfo, HitSoundInfo } from "@osucad/core";
import { bindableBacked, HitSampleInfo, HitWindows, invalidations, safeAssign, SampleAdditions, SampleSet, sampleSetToBank } from "@osucad/core";
import { Bindable, BindableNumber, Line, Vec2 } from "@osucad/framework";
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
  public static readonly attributes: DDSAttributes = {
    type: "@osucad/slider",
    version: 0,
  };

  public constructor(options: SliderOptions = {})
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

  public headCircle: SliderHeadCircle | null = null;

  public tailCircle: SliderTailCircle | null = null;

  public readonly repeatCountBindable = new BindableNumber(0)
    .withMinValue(0)
    .withPrecision(1);


  @type("uint32")
  @bindableBacked("repeatCountBindable")
  public accessor repeatCount!: number

  public spanCount()
  {
    return this.repeatCount + 1;
  }

  public readonly sliderVelocityBindable = new BindableNumber(1)
    .withMinValue(0);

  public get velocity()
  {
    return this.sliderVelocityBindable.value;
  }

  private set velocity(value: number)
  {
    this.sliderVelocityBindable.value = value;
  }

  public spanDuration()
  {
    return this.path.distance / this.velocity;
  }

  public override get duration(): number
  {
    return this.spanDuration() * this.spanCount();
  }

  #tickDistance = 1;

  public get tickDistance()
  {
    return this.#tickDistance;
  }

  public readonly nodeHitSoundsBindable = new Bindable<readonly HitSoundInfo[]>([]);

  public get nodeHitSounds()
  {
    return this.nodeHitSoundsBindable.value;
  }

  public set nodeHitSounds(value)
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

  private bindPathVersion(path: SliderPath)
  {
    path.version.bindValueChanged(() =>
    {
      this.invalidated.emit(this, "applyDefaults");
      console.log("foo");
    });
  }

  @nested(SliderPath)
  @(({ set }) => ({
    init(value)
    {
      this.bindPathVersion(value);

      return value;
    },
    set(value)
    {
      this.bindPathVersion(value);

      set.call(this, value);
    },
  }))
  public accessor path = new SliderPath();

  public spanAt(progress: number)
  {
    return Math.floor(progress * this.spanCount());
  }

  public progressAt(progress: number): number
  {
    let p = (progress * this.spanCount()) % 1;
    if (this.spanAt(progress) % 2 === 1)
      p = 1 - p;
    return p;
  }

  public curvePositionAt(progress: number, out: Vec2 = new Vec2()): Vec2
  {
    return this.path.positionAt(this.progressAt(progress), out);
  }

  public override get endPosition(): Vec2
  {
    return this.position.add(this.curvePositionAt(1));
  }

  public get pathEndPosition()
  {
    return this.path.positionAt(1).addInPlace(this.position);
  }

  public get stackedPathEndPosition()
  {
    return this.pathEndPosition.addInPlace(this.stackOffset);
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

  public override contains(position: Vec2): boolean
  {
    const radiusSquared = this.radius * this.radius;

    if (
      Vec2.closerThanSq(position, this.stackedPosition, this.radius)
      || Vec2.closerThanSq(position, this.stackedPathEndPosition, this.radius)
    )
    {
      return true;
    }

    const vertices = this.path.calculatedRange;

    position = position.sub(this.stackedPosition);

    for (let i = 0; i < vertices.length - 1; i++)
    {
      if (Line.distanceSq(vertices[i], vertices[i + 1], position) < radiusSquared)
        return true;
    }

    return false;
  }

  public override getSnapTargets(): Vec2[]
  {
    return [this.position, this.pathEndPosition];
  }

  public snapPathLength(controlPointInfo: ControlPointInfo, divisor: number)
  {
    const length = this.path.calculatedDistance;
    const duration = Math.ceil(length / this.velocity);
    let time = controlPointInfo.snap(
        this.startTime + duration,
        divisor,
    );

    if (time > this.startTime + duration)
    {
      const beatLength = controlPointInfo.timingPointAt(this.startTime).beatLength;

      time -= beatLength / divisor;
    }

    this.path.expectedDistance = Math.max(0, this.velocity * (time - this.startTime));
  }
}
