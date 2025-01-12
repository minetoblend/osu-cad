import type { ClassSerialDescriptorBuilder, CompositeDecoder, CompositeEncoder } from '@osucad/serialization';
import type { Bindable, IVec2, ReadonlyBindable, ValueChangedEvent } from 'osucad-framework';
import type { BeatmapDifficultyInfo } from '../../../beatmap/BeatmapDifficultyInfo';
import type { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import type { AbstractCrdt } from '../../../crdt/AbstractCrdt';
import type { IHasRepeats } from '../../../hitObjects/IHasRepeats';
import type { IHasSliderVelocity } from '../../../hitObjects/IHasSliderVelocity';
import type { HitSound } from '../../../hitsounds/HitSound';
import type { PathPoint } from './PathPoint';
import { Float32Serializer, listSerialDescriptor, ListSerializer, NullableSerializer, Uint16Serializer } from '@osucad/serialization';
import { CachedValue, Vec2 } from 'osucad-framework';
import { polymorphicHitObjectSerializers } from '../../../hitObjects/HitObject';
import { Additions } from '../../../hitsounds/Additions';
import { HitSample } from '../../../hitsounds/HitSample';
import { HitSoundSerializer } from '../../../hitsounds/HitSound';
import { SampleSet } from '../../../hitsounds/SampleSet';
import { SampleType } from '../../../hitsounds/SampleType';
import { OsuHitObject, OsuHitObjectSerializer } from './OsuHitObject';
import { PathPointSerialDescriptor, PathPointSerializer } from './PathPoint';
import { PathType } from './PathType';
import { SliderEventGenerator } from './SliderEventGenerator';
import { SliderHeadCircle } from './SliderHeadCircle';
import { SliderPath } from './SliderPath';
import { SliderRepeat } from './SliderRepeat';
import { SliderSelection } from './SliderSelection';
import { SliderTailCircle } from './SliderTailCircle';
import { SliderTick } from './SliderTick';

export class Slider extends OsuHitObject implements IHasSliderVelocity, IHasRepeats {
  constructor() {
    super();

    this.path.invalidated.addListener(() => {
      this.#updateNestedPositions();
      this.requestApplyDefaults();
    });

    this.positionBindable.bindValueChanged(() => this.#endPositionCache.invalidate());

    this.ensureHitSoundsAreValid();

    this.#repeatCount.bindable.valueChanged.addListener(() => {
      this.ensureHitSoundsAreValid();
      this.requestApplyDefaults();
    });
  }

  override get position() {
    return super.position;
  }

  override set position(value) {
    super.position = value;
  }

  headCircle: SliderHeadCircle | null = null;

  tailCircle: SliderTailCircle | null = null;

  readonly hasRepeats = true;

  #repeatCount = this.property('repeatCount', 0);

  get repeatCountBindable() {
    return this.#repeatCount.bindable;
  }

  get repeatCount() {
    return this.#repeatCount.value;
  }

  set repeatCount(value: number) {
    this.#repeatCount.value = value;
  }

  get spanCount() {
    return this.repeatCount + 1;
  }

  readonly hasSliderVelocity = true;

  #sliderVelocity = this.property('velocity', 1);

  get velocityBindable(): ReadonlyBindable<number> {
    return this.#sliderVelocity.bindable;
  }

  public get sliderVelocity() {
    return this.#sliderVelocity.value;
  }

  private set sliderVelocity(value: number) {
    this.#sliderVelocity.value = Math.max(value, 0);
  }

  #sliderVelocityOverride = this.property<number | null>('sliderVelocityOverride', null);

  get sliderVelocityOverrideBindable(): Bindable<number | null> {
    return this.#sliderVelocityOverride.bindable;
  }

  get sliderVelocityOverride() {
    return this.#sliderVelocityOverride.value;
  }

  set sliderVelocityOverride(value: number | null) {
    if (value === this.sliderVelocityOverride)
      return;

    this.#sliderVelocityOverride.value = value;

    this.#computeVelocity();
  }

  #baseVelocity = 1;

  get baseVelocity() {
    return this.#baseVelocity;
  }

  #controlPointVelocity = 1;

  #computeVelocity() {
    if (this.sliderVelocityOverride !== null)
      this.sliderVelocity = this.#baseVelocity * this.sliderVelocityOverride;
    else
      this.sliderVelocity = this.#baseVelocity * this.#controlPointVelocity;
  }

  get spanDuration(): number {
    return this.expectedDistance / this.sliderVelocity;
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

  set controlPoints(value: readonly PathPoint[]) {
    this.path.controlPoints = value;
  }

  generateTicks = true;

  tickDistanceMultiplier = 1;

  protected override applyDefaultsToSelf(controlPointInfo: ControlPointInfo, difficulty: BeatmapDifficultyInfo) {
    super.applyDefaultsToSelf(controlPointInfo, difficulty);

    const timingPoint = controlPointInfo.timingPointAt(this.startTime + 1);

    this.#baseVelocity = Slider.base_scoring_distance * difficulty.sliderMultiplier / timingPoint.beatLength;

    const difficultyPoint = controlPointInfo.difficultyPointAt(this.startTime);

    this.#controlPointVelocity = difficultyPoint.sliderVelocity;

    this.#computeVelocity();

    const scoringDistance = this.sliderVelocity * timingPoint.beatLength;

    this.#tickDistance = this.generateTicks ? (scoringDistance / difficulty.sliderTickRate * this.tickDistanceMultiplier) : Infinity;

    this.subSelection.update();
  }

  getPositionAtTime(time: number, out = new Vec2()) {
    this.getPathPositionAtTime(time, out);

    const stackedPosition = this.stackedPosition;

    out.x += stackedPosition.x;
    out.y += stackedPosition.y;

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

  override contains(point: IVec2): boolean {
    if (this.headCircle?.contains(point) || this.tailCircle?.contains(point))
      return true;

    point = Vec2.sub(point, this.stackedPosition);

    const radiusSquared = this.radius * this.radius;

    const path = this.path.calculatedPath.vertices;
    let distance = 0;
    const step = this.radius * 0.3;
    let i = 1;
    while (
      distance < Math.min(this.path.expectedDistance, this.path.calculatedDistance)
    ) {
      distance += step;
      distance = Math.min(
        distance,
        Math.min(this.path.expectedDistance, this.path.calculatedDistance),
      );

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

  override get endPosition() {
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

  #hitSounds = this.property<readonly HitSound[]>('hitSounds', []);

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

  protected override createNestedHitObjects() {
    super.createNestedHitObjects();

    const sliderEvents = SliderEventGenerator.generate(
      this.startTime,
      this.spanDuration,
      this.sliderVelocity,
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

  override isSlider(): this is Slider {
    return true;
  }

  protected override createHitSamples(controlPointInfo: ControlPointInfo) {
    const samplePoint = controlPointInfo.samplePointAt(this.startTime);
    let sampleSet = this.hitSound.sampleSet;
    if (sampleSet === SampleSet.Auto)
      sampleSet = samplePoint.sampleSet;

    const volume = controlPointInfo.volumeAt(this.startTime);

    this.addHitSample(new HitSample(
      this.startTime,
      sampleSet,
      SampleType.SliderSlide,
      volume,
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
        volume,
        samplePoint.sampleIndex,
        this.duration,
      ));
    }

    for (let i = 0; i < this.hitSounds.length; i++) {
      const time = this.startTime + this.spanDuration * i;
      const hitSound = this.hitSounds[i];

      const samplePoint = controlPointInfo.samplePointAt(Math.ceil(time));

      const volume = controlPointInfo.volumeAt(Math.ceil(time));

      let sampleSet = hitSound.sampleSet;
      if (sampleSet === SampleSet.Auto)
        sampleSet = samplePoint.sampleSet;

      this.addHitSample(
        new HitSample(
          time,
          sampleSet,
          SampleType.Normal,
          volume,
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
            volume,
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

  override get childObjects(): readonly AbstractCrdt<any>[] {
    return [
      this.path,
    ];
  }

  removeControlPoint(index: number) {
    if (index < 0 || index >= this.controlPoints.length)
      return false;

    const path = [...this.controlPoints];

    if (index === 0 && path.length >= 2) {
      const offset = path[1].position;
      const type = path[0].type ?? PathType.Bezier;

      for (let i = 0; i < path.length; i++)
        path[i] = path[i].withPosition(path[i].position.sub(offset));

      path[1] = path[1].withType(type);

      this.position = this.position.add(offset);
    }

    this.controlPoints = path.toSpliced(index, 1);

    return true;
  }

  snapLength(controlPointInfo: ControlPointInfo, beatDivisor: number) {
    const length = this.path.calculatedDistance;
    const duration = Math.ceil(length / this.sliderVelocity);
    let time = controlPointInfo.snap(
      // adding a tiny bit of length to make up for precision errors shortening the slider
      Math.ceil(this.startTime + duration) + 1,
      beatDivisor,
      false,
    );

    if (time > this.startTime + duration) {
      const beatLength = controlPointInfo.timingPointAt(this.startTime).beatLength;

      time -= beatLength / beatDivisor;
    }

    this.expectedDistance = Math.max(0, this.sliderVelocity * (time - this.startTime));
  }
}

export class SliderSerializer extends OsuHitObjectSerializer<Slider> {
  constructor() {
    super('Slider');
  }

  protected override buildDescriptor(builder: ClassSerialDescriptorBuilder) {
    super.buildDescriptor(builder);
    builder.element('repeatCount', Uint16Serializer.descriptor, true);
    builder.element('velocityOverride', new NullableSerializer(Float32Serializer).descriptor, true);
    builder.element('expectedDistance', Float32Serializer.descriptor);
    builder.element('controlPoints', listSerialDescriptor(new PathPointSerialDescriptor()));
    builder.element('hitSounds  ', listSerialDescriptor(HitSoundSerializer.instance.descriptor));
  }

  protected override serializeProperties(encoder: CompositeEncoder, object: Slider) {
    super.serializeProperties(encoder, object);
    encoder.encodeUint16Element(this.descriptor, 5, object.repeatCount);

    encoder.encodeNullableSerializableElement(this.descriptor, 6, new NullableSerializer(Float32Serializer), object.sliderVelocityOverride);

    encoder.encodeFloat32Element(this.descriptor, 7, object.expectedDistance);

    encoder.encodeSerializableElement(this.descriptor, 8, new ListSerializer(new PathPointSerializer()), object.path.controlPoints as any);

    encoder.encodeSerializableElement(this.descriptor, 9, new ListSerializer(HitSoundSerializer.instance), object.hitSounds);
  }

  protected override deserializeProperties(decoder: CompositeDecoder, object: Slider) {
    super.deserializeProperties(decoder, object);

    object.repeatCount = decoder.decodeUint16Element(this.descriptor, 5);
    object.sliderVelocityOverride = decoder.decodeNullableSerializableElement(this.descriptor, 6, Float32Serializer);
    object.expectedDistance = decoder.decodeFloat32Element(this.descriptor, 7);
    object.controlPoints = decoder.decodeSerializableElement(this.descriptor, 8, new ListSerializer(new PathPointSerializer()));
    object.hitSounds = decoder.decodeSerializableElement(this.descriptor, 9, new ListSerializer(HitSoundSerializer.instance));
  }

  protected override createInstance(): Slider {
    return new Slider();
  }
}

polymorphicHitObjectSerializers.set(Slider, new SliderSerializer());
