import type { IVec2, ReadonlyBindable, ValueChangedEvent } from 'osucad-framework';
import type { IPatchable } from '../../editor/commands/IPatchable';
import type { BeatmapDifficultyInfo } from '../BeatmapDifficultyInfo';
import type { HitSound } from '../hitSounds/HitSound';
import type { SerializedSlider } from '../serialization/HitObjects';
import type { ControlPointInfo } from '../timing/ControlPointInfo';
import { CachedValue, Vec2 } from 'osucad-framework';
import { SliderPatchEncoder } from '../../editor/commands/patchEncoder/SliderPatchEncoder';
import { Additions } from '../hitSounds/Additions.ts';
import { HitSample } from '../hitSounds/HitSample';
import { SampleSet } from '../hitSounds/SampleSet';
import { SampleType } from '../hitSounds/SampleType';
import { deserializeHitSound } from '../serialization/HitSound';
import { HitObjectProperty } from './HitObjectProperty';
import { OsuHitObject } from './OsuHitObject';
import { PathPoint } from './PathPoint';
import { SliderEventGenerator } from './SliderEventGenerator';
import { SliderHeadCircle } from './SliderHeadCircle';
import { SliderPath } from './SliderPath';
import { SliderRepeat } from './SliderRepeat';
import { SliderSelection } from './SliderSelection.ts';
import { SliderTailCircle } from './SliderTailCircle';
import { SliderTick } from './SliderTick';

export class Slider extends OsuHitObject implements IPatchable<SerializedSlider> {
  constructor() {
    super();

    this.path.invalidated.addListener(() => {
      this.#updateNestedPositions();
      this.requestApplyDefaults();
    });
  }

  get position() {
    return super.position;
  }

  set position(value) {
    super.position = value;
    this.#updateNestedPositions();
  }

  headCircle: SliderHeadCircle | null = null;

  tailCircle: SliderTailCircle | null = null;

  #repeatCount = 0;

  get repeatCount() {
    return this.#repeatCount;
  }

  set repeatCount(value: number) {
    if (value === this.#repeatCount)
      return;

    this.#repeatCount = value;

    this.ensureHitSoundsAreValid();
    this.requestApplyDefaults();
  }

  get spanCount() {
    return this.repeatCount + 1;
  }

  #velocity = new HitObjectProperty(this, 'velocity', 1);

  get velocityBindable(): ReadonlyBindable<number> {
    return this.#velocity.bindable;
  }

  public get velocity() {
    return this.#velocity.value;
  }

  private set velocity(value: number) {
    this.#velocity.value = Math.max(value, 0);
  }

  #velocityOverride = new HitObjectProperty<number | null>(this, 'velocityOverride', null);

  get velocityOverrideBindable(): ReadonlyBindable<number | null> {
    return this.#velocityOverride.bindable;
  }

  get velocityOverride() {
    return this.#velocityOverride.value;
  }

  set velocityOverride(value: number | null) {
    if (value === this.velocityOverride)
      return;

    this.#velocityOverride.value = value;

    this.#computeVelocity();
  }

  #baseVelocity = 1;

  get baseVelocity() {
    return this.#baseVelocity;
  }

  #controlPointVelocity = 1;

  #computeVelocity() {
    if (this.velocityOverride !== null)
      this.velocity = this.#baseVelocity * this.velocityOverride;
    else
      this.velocity = this.#baseVelocity * this.#controlPointVelocity;
  }

  get spanDuration(): number {
    return this.expectedDistance / this.velocity;
  }

  override get duration(): number {
    return this.spanDuration * this.spanCount;
  }

  #tickDistance = 0;

  get tickDistance() {
    return this.#tickDistance;
  }

  readonly path = new SliderPath();

  get expectedDistance() {
    return this.path.expectedDistance;
  }

  set expectedDistance(value) {
    this.path.expectedDistance = value;
  }

  get controlPoints(): readonly PathPoint[] {
    return this.path.controlPoints;
  }

  set controlPoints(value: PathPoint[]) {
    this.path.controlPoints = value;
  }

  generateTicks = true;

  tickDistanceMultiplier = 1;

  protected applyDefaultsToSelf(controlPointInfo: ControlPointInfo, difficulty: BeatmapDifficultyInfo) {
    super.applyDefaultsToSelf(controlPointInfo, difficulty);

    const timingPoint = controlPointInfo.timingPointAt(this.startTime);

    this.#baseVelocity = Slider.base_scoring_distance * difficulty.sliderMultiplier / timingPoint.beatLength;

    const difficultyPoint = controlPointInfo.difficultyPointAt(this.startTime);

    this.#controlPointVelocity = difficultyPoint.sliderVelocity;

    this.#computeVelocity();

    const scoringDistance = this.velocity * timingPoint.beatLength;

    this.#tickDistance = this.generateTicks ? (scoringDistance / difficulty.sliderTickRate * this.tickDistanceMultiplier) : Infinity;

    this.subSelection.update();
  }

  getPositionAtTime(time: number, out = new Vec2()) {
    this.getPathPositionAtTime(time, out);

    const stackedPosition = this.stackedPosition;

    out.x = stackedPosition.x;
    out.y = stackedPosition.y;

    return out;
  }

  getPathPositionAtTime(time: number, out: Vec2) {
    return this.path.getPositionAtDistance(
      this.getProgressAtTime(time) * this.expectedDistance,
      out,
    );
  }

  getPathAngleAtTime(time: number) {
    if (time <= this.startTime + 1) {
      time = this.startTime + 1;
    }

    const p1 = this.getPositionAtTime(time - 1);
    const p2 = this.getPositionAtTime(time);

    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  getProgressAtTime(time: number) {
    time -= this.startTime;

    if (time < 0)
      return 0;
    if (time > this.duration)
      return this.repeatCount % 2 === 0 ? 1 : 0;

    const spanIndex = Math.floor(time / this.spanDuration);

    const spanStartTime = spanIndex * this.spanDuration;

    let spanProgress = (time - spanStartTime) / this.spanDuration;
    if (spanIndex % 2 === 1)
      spanProgress = 1 - spanProgress;

    return spanProgress;
  }

  readonly subSelection = new SliderSelection(this);

  contains(point: IVec2): boolean {
    if (this.headCircle?.contains(point) || this.tailCircle?.contains(point))
      return true;

    point = Vec2.sub(point, this.stackedPosition);

    const radiusSquared = this.radius * this.radius;

    const path = this.path.calculatedPath.vertices;
    let distance = 0;
    const step = 10;
    let i = 1;
    while (
      distance < Math.min(this.path.expectedDistance, this.path.calculatedDistance)
    ) {
      distance += step;
      while (i < path.length - 1 && this.path.calculatedPath.cumulativeDistance[i] < distance)
        i++;

      const p1 = path[i - 1];
      const p2 = path[i];
      const d1 = this.path.calculatedPath.cumulativeDistance[i - 1];
      const d2 = this.path.calculatedPath.cumulativeDistance[i];
      const t = (distance - d1) / (d2 - d1);
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;

      if (Vec2.closerThanSq(new Vec2(x, y), point, radiusSquared))
        return true;
    }

    return false;
  }

  #endPositionCache = new CachedValue<Vec2>();

  spanAt(progress: number): number {
    return Math.floor(progress * this.spanCount);
  }

  progressAt(progress: number): number {
    let p = (progress * this.spanCount) % 1;
    if (this.spanAt(progress) % 2 === 1)
      p = 1 - p;
    return p;
  }

  curvePositionAt(progress: number, out: Vec2 = new Vec2()): Vec2 {
    return this.path.getPositionAt(this.progressAt(progress), out);
  }

  get endPosition() {
    if (!this.#endPositionCache.isValid)
      this.#endPositionCache.value = this.position.add(this.curvePositionAt(1));

    return this.#endPositionCache.value;
  }

  #updateNestedPositions() {
    this.#endPositionCache.invalidate();

    if (this.headCircle)
      this.headCircle.position = this.position;

    if (this.tailCircle)
      this.tailCircle.position = this.endPosition;
  }

  #hitSounds = new HitObjectProperty<readonly HitSound[]>(this, 'hitSounds', []);

  get hitSoundsBindable() {
    return this.#hitSounds.bindable;
  }

  get hitSounds() {
    return this.#hitSounds.value;
  }

  set hitSounds(value: readonly HitSound[]) {
    if (this.hitSounds.length === value.length
      && this.hitSounds.every((h, index) => h.equals(value[index]))) {
      return;
    }

    this.#hitSounds.value = value;

    this.requestApplyDefaults();
  }

  protected createNestedHitObjects() {
    super.createNestedHitObjects();

    const sliderEvents = SliderEventGenerator.generate(
      this.startTime,
      this.spanDuration,
      this.velocity,
      this.tickDistance,
      this.path.expectedDistance,
      this.spanCount,
    );

    for (const e of sliderEvents) {
      switch (e.type) {
        case 'tick':
          this.addNested(
            Object.assign(new SliderTick(), {
              spanIndex: e.spanIndex,
              spanStartTime: e.spanStartTime,
              startTime: e.time,
              position: this.position.add(this.path.getPositionAt(e.pathProgress, new Vec2())),
              stackHeight: this.stackHeight,
            }),
          );
          break;

        case 'head':
          this.addNested(this.headCircle = Object.assign(new SliderHeadCircle(), {
            startTime: e.time,
            position: this.position,
            stackHeight: this.stackHeight,
          }));
          break;

        case 'tail':
          this.addNested(this.tailCircle = Object.assign(new SliderTailCircle(this), {
            repeatIndex: e.spanIndex,
            startTime: e.time,
            position: this.endPosition,
            stackHeight: this.stackHeight,
          }));
          break;

        case 'repeat':
          this.addNested(Object.assign(new SliderRepeat(this), {
            repeatIndex: e.spanIndex,
            startTime: e.time,
            position: this.position.add(this.path.getPositionAt(e.pathProgress)),
            stackHeight: this.stackHeight,
          }));
      }
    }
  }

  applyPatch(patch: Partial<SerializedSlider>) {
    super.applyPatch(patch);

    if (patch.repeatCount !== undefined)
      this.repeatCount = patch.repeatCount;
    if (patch.velocityOverride !== undefined)
      this.velocityOverride = patch.velocityOverride;
    if (patch.controlPoints !== undefined)
      this.controlPoints = patch.controlPoints.map(p => new PathPoint(Vec2.from(p.position), p.type));
    if (patch.expectedDistance !== undefined)
      this.expectedDistance = patch.expectedDistance;
    if (patch.hitSounds !== undefined)
      this.hitSounds = patch.hitSounds.map(deserializeHitSound);
  }

  createPatchEncoder() {
    return new SliderPatchEncoder(this);
  }

  isSlider(): this is Slider {
    return true;
  }

  protected createHitSamples(controlPointInfo: ControlPointInfo) {
    const samplePoint = controlPointInfo.samplePointAt(this.startTime);
    let sampleSet = this.hitSound.sampleSet;
    if (sampleSet === SampleSet.Auto)
      sampleSet = samplePoint.sampleSet;

    this.addHitSample(new HitSample(
      this.startTime,
      sampleSet,
      SampleType.SliderSlide,
      samplePoint.volume,
      samplePoint.sampleIndex,
      this.duration,
    ));

    let additionSampleSet = this.hitSound.additionSampleSet;
    if (additionSampleSet === SampleSet.Auto)
      additionSampleSet = sampleSet;

    if (this.hitSound.additions & Additions.Whistle) {
      this.addHitSample(new HitSample(
        this.startTime,
        additionSampleSet,
        SampleType.SliderWhistle,
        samplePoint.volume,
        samplePoint.sampleIndex,
        this.duration,
      ));
    }

    for (let i = 0; i < this.hitSounds.length; i++) {
      const time = this.startTime + this.spanDuration * i;
      const hitSound = this.hitSounds[i];

      const samplePoint = controlPointInfo.samplePointAt(time);

      let sampleSet = hitSound.sampleSet;
      if (sampleSet === SampleSet.Auto)
        sampleSet = samplePoint.sampleSet;

      this.addHitSample(
        new HitSample(
          time,
          sampleSet,
          SampleType.Normal,
          samplePoint.volume,
          samplePoint.sampleIndex,
        ),
      );

      let additionSampleSet = hitSound.additionSampleSet;
      if (additionSampleSet === SampleSet.Auto)
        additionSampleSet = sampleSet;

      for (const sampleType of hitSound.getSampleTypes()) {
        this.addHitSample(
          new HitSample(
            time,
            additionSampleSet,
            sampleType,
            samplePoint.volume,
            samplePoint.sampleIndex,
          ),
        );
      }
    }
  }

  ensureHitSoundsAreValid() {
    if (this.hitSounds.length === this.spanCount + 1)
      return;

    const hitSounds = this.hitSounds.slice(0, this.spanCount + 1);

    while (hitSounds.length < this.spanCount + 1) {
      hitSounds.push(
        hitSounds[hitSounds.length - 1] ?? this.hitSound,
      );
    }

    this.hitSounds = hitSounds;

    this.subSelection.update();
  }

  protected override onStartTimeChanged(time: ValueChangedEvent<number>) {
    super.onStartTimeChanged(time);
  }
}
