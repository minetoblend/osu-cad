import type { ControlPointInfo, HitWindows, IHasComboInformation, IHasXPosition, ISkin } from '@osucad/core';
import type { IVec2 } from '@osucad/framework';
import type { HitCircle } from './HitCircle';
import type { Slider } from './Slider';
import type { Spinner } from './Spinner';
import { BeatmapDifficultyInfo, getSkinComboColor, HitObject, HitObjectProperty, HitSample, HitSound, hitsoundSerializer, SampleSet, SampleType, vec2Serializer } from '@osucad/core';
import { Vec2 } from '@osucad/framework';

import { Color } from 'pixi.js';
import { OsuHitWindows } from './OsuHitWindows';

export abstract class OsuHitObject extends HitObject implements IHasComboInformation, IHasXPosition {
  static readonly object_radius = 64;

  static readonly object_dimensions = new Vec2(OsuHitObject.object_radius * 2);

  static readonly base_scoring_distance = 100;

  static readonly preempt_min = 450;

  static readonly preempt_mid = 1200;

  static readonly preempt_max = 1800;

  #position = this.property('position', new Vec2(0, 0), vec2Serializer);

  get positionBindable() {
    return this.#position.bindable;
  }

  get position() {
    return this.#position.value;
  }

  set position(value: Vec2) {
    if (this.#position.value.equals(value))
      return;

    this.#position.value = value;
  }

  moveBy(delta: IVec2) {
    this.position = this.position.add(delta);
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

  #newCombo = this.property('newCombo', false);

  get newComboBindable() {
    return this.#newCombo.bindable;
  }

  get newCombo() {
    return this.#newCombo.value;
  }

  set newCombo(value: boolean) {
    this.#newCombo.value = value;
  }

  #comboOffset = this.property('comboOffset', 0);

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

  #hitSound = this.property('hitSound', HitSound.Default, hitsoundSerializer);

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

  contains(position: IVec2): boolean {
    return false;
  }

  isVisibleAtTime(time: number): boolean {
    return time > this.startTime - this.timePreempt && time < this.endTime + 700;
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

    const volume = controlPointInfo.volumeAt(this.startTime);

    this.addHitSample(
      new HitSample(
        this.startTime,
        sampleSet,
        SampleType.Normal,
        volume,
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

  getComboColor(skin: ISkin): Color {
    return getSkinComboColor(this, skin);
  }

  lazyEndPosition: Vec2 | null = null;

  lazyTravelTime: number | null = null;

  lazyTravelDistance = 0;

  lazyTravelPath: { position: Vec2; time: number }[] | null = null;
}
