import type { OperatorContext } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import type { Slider } from '../../hitObjects/Slider';
import { EditorClock, FloatOperatorProperty, HitObjectSelectionManager, Operator } from '@osucad/core';
import { BindableNumber, resolved } from '@osucad/framework';
import { HitCircle } from '../../hitObjects/HitCircle';

export class ConvertToStreamOperator extends Operator<OsuHitObject> {
  constructor(readonly slider: Slider) {
    super({
      title: 'Convert to stream',
    });
    this.prominent = true;
  }

  readonly spacing = new FloatOperatorProperty({
    title: 'Spacing',
    defaultValue: new BindableNumber(1)
      .withPrecision(0.01)
      .withMinValue(0.1),
    precision: 1,
    remember: true,
  });

  readonly divisor = new FloatOperatorProperty({
    title: 'Beat Divisor',
    defaultValue: new BindableNumber(4)
      .withPrecision(1)
      .withMinValue(1),
    precision: 0,
  });

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(HitObjectSelectionManager)
  selection!: HitObjectSelectionManager;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.divisor.value = this.editorClock.beatSnapDivisor.value;
  }

  override apply({ beatmap }: OperatorContext<OsuHitObject>) {
    if (this.slider.spanDuration <= 0)
      return;

    const timingPoint = beatmap.controlPoints.timingPointAt(this.slider.startTime);

    const stepSize = timingPoint.beatLength / this.divisor.value;

    const duration = this.slider.spanDuration / this.spacing.value + 1;

    for (let time = 0; time <= duration; time += stepSize) {
      const circle = new HitCircle();

      const pathSampleTime = this.slider.startTime + time * this.spacing.value;
      if (pathSampleTime > this.slider.startTime + this.slider.spanDuration + 1)
        break;

      circle.startTime = this.slider.startTime + time;
      circle.position = this.slider.getPositionAtTime(pathSampleTime);
      circle.hitSound = this.slider.hitSounds[0] ?? this.slider.hitSound;

      if (time === this.slider.startTime)
        circle.newCombo = this.slider.newCombo;

      beatmap.hitObjects.add(circle);
      this.selection.select(circle);
    }

    beatmap.hitObjects.remove(this.slider);
  }
}
