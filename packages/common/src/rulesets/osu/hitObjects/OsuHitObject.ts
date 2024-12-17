import type { ClassSerialDescriptorBuilder, CompositeDecoder, CompositeEncoder } from '@osucad/serialization';
import type { IPatchable } from '../../../commands/IPatchable';
import type { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import type { HitWindows } from '../../../hitObjects/HitWindows';
import type { IHasComboInformation } from '../../../hitObjects/IHasComboInformation';
import type { SerializedOsuHitObject } from '../../../serialization/HitObjects';
import type { HitCircle } from './HitCircle';
import type { Slider } from './Slider';
import type { Spinner } from './Spinner';
import { BooleanSerializer, nullableDescriptor, NullableSerializer, Uint8Serializer } from '@osucad/serialization';
import { Action, Vec2, Vec2Serializer } from 'osucad-framework';
import { Color } from 'pixi.js';
import { BeatmapDifficultyInfo } from '../../../beatmap/BeatmapDifficultyInfo';
import { HitObject, HitObjectSerializer } from '../../../hitObjects/HitObject';
import { HitObjectProperty } from '../../../hitObjects/HitObjectProperty';
import { HitSample } from '../../../hitsounds/HitSample';
import { HitSound, HitSoundSerializer } from '../../../hitsounds/HitSound';
import { SampleSet } from '../../../hitsounds/SampleSet';
import { SampleType } from '../../../hitsounds/SampleType';
import { deserializeHitSound } from '../../../serialization/HitSound';
import { OsuHitWindows } from './OsuHitWindows';

export abstract class OsuHitObject extends HitObject implements IHasComboInformation, IPatchable<SerializedOsuHitObject> {
  readonly needsDefaultsApplied = new Action<OsuHitObject>();

  protected requestApplyDefaults() {
    this.needsDefaultsApplied.emit(this);
  }

  constructor() {
    super();

    this.startTimeBindable.valueChanged.addListener(this.requestApplyDefaults, this);
  }

  static readonly object_radius = 64;

  static readonly object_dimensions = new Vec2(OsuHitObject.object_radius * 2);

  static readonly base_scoring_distance = 100;

  static readonly preempt_min = 450;

  static readonly preempt_mid = 1200;

  static readonly preempt_max = 1800;

  #position = new HitObjectProperty(this, 'position', new Vec2(0, 0));

  get positionBindable() {
    return this.#position.bindable;
  }

  get position() {
    return this.#position.value;
  }

  set position(value: Vec2) {
    this.#position.value = value;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get stackedPosition() {
    return this.position.add(this.stackOffset);
  }

  get endPosition() {
    return this.position;
  }

  stackRoot?: string;

  get stackedEndPosition() {
    return this.endPosition.add(this.stackOffset);
  }

  #stackHeight = new HitObjectProperty(this, 'stackHeight', 0);

  get stackHeightBindable() {
    return this.#stackHeight.bindable;
  }

  get stackHeight() {
    return this.#stackHeight.value;
  }

  set stackHeight(value: number) {
    this.#stackHeight.value = value;
  }

  get stackOffset() {
    return new Vec2(this.stackHeight * this.scale * -6.4);
  }

  get radius() {
    return OsuHitObject.object_radius * this.scale;
  }

  #scale = new HitObjectProperty(this, 'scale', 1);

  get scaleBindable() {
    return this.#scale.bindable;
  }

  get scale() {
    return this.#scale.value;
  }

  set scale(value: number) {
    this.#scale.value = value;
  }

  readonly hasComboInformation = true;

  #newCombo = new HitObjectProperty(this, 'newCombo', false);

  get newComboBindable() {
    return this.#newCombo.bindable;
  }

  get newCombo() {
    return this.#newCombo.value;
  }

  set newCombo(value: boolean) {
    this.#newCombo.value = value;
  }

  #comboOffset = new HitObjectProperty(this, 'comboOffset', 0);

  get comboOffsetBindable() {
    return this.#comboOffset.bindable;
  }

  get comboOffset() {
    return this.#comboOffset.value;
  }

  set comboOffset(value: number) {
    this.#comboOffset.value = value;
  }

  #indexInCurrentCombo = new HitObjectProperty(this, 'indexInCurrentCombo', 0);

  get indexInComboBindable() {
    return this.#indexInCurrentCombo.bindable;
  }

  get indexInCombo() {
    return this.#indexInCurrentCombo.value;
  }

  set indexInCombo(value: number) {
    this.#indexInCurrentCombo.value = value;
  }

  #comboIndex = new HitObjectProperty(this, 'comboIndex', 0);

  get comboIndexBindable() {
    return this.#comboIndex.bindable;
  }

  get comboIndex() {
    return this.#comboIndex.value;
  }

  set comboIndex(value: number) {
    this.#comboIndex.value = value;
  }

  #comboColor = new HitObjectProperty(this, 'comboColor', new Color(0xFFFFFF));

  get comboColorBindable() {
    return this.#comboColor.bindable;
  }

  set comboColor(value: Color) {
    this.#comboColor.value = value;
  }

  get comboColor() {
    return this.#comboColor.value;
  }

  #hitSound = new HitObjectProperty(this, 'hitSound', HitSound.Default);

  get hitSoundBindable() {
    return this.#hitSound.bindable;
  }

  get hitSound() {
    return this.#hitSound.value;
  }

  set hitSound(value: HitSound) {
    if (this.hitSound.equals(value))
      return;

    this.#hitSound.value = value;

    this.requestApplyDefaults();
  }

  #hitSamples: HitSample[] = [];

  get hitSamples(): readonly HitSample[] {
    return this.#hitSamples;
  }

  protected addHitSample(...sample: HitSample[]) {
    this.#hitSamples.push(...sample);
  }

  isVisibleAtTime(time: number): boolean {
    return time > this.startTime - this.timePreempt && time < this.endTime + 800;
  }

  protected override applyDefaultsToSelf(controlPointInfo: ControlPointInfo, difficulty: BeatmapDifficultyInfo) {
    super.applyDefaultsToSelf(controlPointInfo, difficulty);

    this.timePreempt = BeatmapDifficultyInfo.difficultyRange(difficulty.approachRate, OsuHitObject.preempt_max, OsuHitObject.preempt_mid, OsuHitObject.preempt_min);

    this.timeFadeIn = 400 * Math.min(1, this.timePreempt / OsuHitObject.preempt_min);

    this.scale = difficulty.calculateCircleSize(true);
  }

  override applyDefaults(controlPointInfo: ControlPointInfo, difficulty: BeatmapDifficultyInfo) {
    super.applyDefaults(controlPointInfo, difficulty);

    for (const g of this.nestedHitObjects) {
      if (g instanceof OsuHitObject) {
        g.comboColorBindable.bindTo(this.comboColorBindable);
        g.stackHeightBindable.bindTo(this.stackHeightBindable);
      }
    }

    this.#hitSamples = [];
    this.createHitSamples(controlPointInfo);
  }

  protected createHitSamples(controlPointInfo: ControlPointInfo) {
    const samplePoint = controlPointInfo.samplePointAt(this.startTime);

    let sampleSet = this.hitSound.sampleSet;
    if (sampleSet === SampleSet.Auto)
      sampleSet = samplePoint.sampleSet;

    this.addHitSample(
      new HitSample(
        this.startTime,
        sampleSet,
        SampleType.Normal,
        samplePoint.volume,
        samplePoint.sampleIndex,
      ),
    );

    let additionSampleSet = this.hitSound.additionSampleSet;
    if (additionSampleSet === SampleSet.Auto)
      additionSampleSet = sampleSet;

    for (const sampleType of this.hitSound.getSampleTypes()) {
      this.addHitSample(
        new HitSample(
          this.startTime,
          additionSampleSet,
          sampleType,
          samplePoint.volume,
          samplePoint.sampleIndex,
        ),
      );
    }
  }

  applyPatch(patch: Partial<SerializedOsuHitObject>) {
    if (patch.startTime !== undefined)
      this.startTime = patch.startTime;
    if (patch.position !== undefined)
      this.position = Vec2.from(patch.position);
    if (patch.comboOffset !== undefined)
      this.comboOffset = patch.comboOffset;
    if (patch.newCombo !== undefined)
      this.newCombo = patch.newCombo;
    if (patch.hitSound)
      this.hitSound = deserializeHitSound(patch.hitSound);
  }

  isHitCircle(): this is HitCircle {
    return false;
  }

  isSlider(): this is Slider {
    return false;
  }

  isSpinner(): this is Spinner {
    return false;
  }

  protected override createHitWindows(): HitWindows {
    return new OsuHitWindows();
  }

  lazyEndPosition: Vec2 | null = null;

  lazyTravelTime: number | null = null;

  lazyTravelDistance = 0;

  lazyTravelPath: { position: Vec2; time: number }[] | null = null;
}

export abstract class OsuHitObjectSerializer<T extends OsuHitObject> extends HitObjectSerializer<T> {
  protected constructor(serialName: string) {
    super(serialName);
  }

  protected override buildDescriptor(builder: ClassSerialDescriptorBuilder) {
    super.buildDescriptor(builder);
    builder.element('position', Vec2Serializer.descriptor);
    builder.element('newCombo', nullableDescriptor(BooleanSerializer.descriptor), true);
    builder.element('comboOffset', nullableDescriptor(Uint8Serializer.descriptor), true);
    builder.element('hitSound', HitSoundSerializer.instance.descriptor);
  }

  protected override serializeProperties(encoder: CompositeEncoder, object: T) {
    super.serializeProperties(encoder, object);
    encoder.encodeSerializableElement(this.descriptor, 1, Vec2Serializer, object.position);
    if (object.newCombo)
      encoder.encodeBooleanElement(this.descriptor, 2, object.newCombo);
    encoder.encodeUint8Element(this.descriptor, 3, object.comboOffset);
    encoder.encodeSerializableElement(this.descriptor, 4, HitSoundSerializer.instance, object.hitSound);
  }

  protected override deserializeProperties(decoder: CompositeDecoder, object: T) {
    super.deserializeProperties(decoder, object);
    object.position = decoder.decodeSerializableElement(this.descriptor, 1, Vec2Serializer);
    object.newCombo = decoder.decodeSerializableElement(this.descriptor, 2, new NullableSerializer(BooleanSerializer)) ?? false;
    object.comboOffset = decoder.decodeUint8Element(this.descriptor, 3) ?? 0;
    object.hitSound = decoder.decodeSerializableElement(this.descriptor, 4, HitSoundSerializer.instance);
  }
}
