import type { DependencyContainer, ReadonlyDependencyContainer } from 'osucad-framework';
import type { JudgementResult } from '../../../../hitObjects/JudgementResult';
import type { ClickAction } from '../../ui/ClickAction';
import type { OsuHitObject } from '../OsuHitObject';
import { Bindable, dependencyLoader, Vec2 } from 'osucad-framework';
import { DrawableHitObject } from '../../../../hitObjects/drawables/DrawableHitObject';
import { HitResult } from '../../../../hitObjects/HitResult';
import { HitSample } from '../../../../hitsounds/HitSample';
import { SampleSet } from '../../../../hitsounds/SampleSet';
import { SampleType } from '../../../../hitsounds/SampleType';
import { OsuActionInputManager } from '../../OsuActionInputManager';
import { DrawableHitSound } from './DrawableHitSound';

export class DrawableOsuHitObject<T extends OsuHitObject = OsuHitObject> extends DrawableHitObject {
  constructor(hitObject?: T) {
    super(hitObject);
  }

  positionBindable = new Bindable(new Vec2());

  stackHeightBindable = new Bindable(0);

  scaleBindable = new Bindable(1);

  indexInComboBindable = new Bindable(0);

  checkHittable: ((hitObject: DrawableHitObject, time: number, result: HitResult) => ClickAction) | null = null;

  #osuActionInputManager: OsuActionInputManager | null = null;

  get osuActionInputManager() {
    this.#osuActionInputManager ??= this.findClosestParentOfType(OsuActionInputManager);

    return this.#osuActionInputManager;
  }

  hitForcefully(timeOffset?: number) {
    this.applyResult((r, h) => {
      r.type = HitResult.Great;
      if (timeOffset !== undefined) {
        r.timeOffset = timeOffset;
        r.absoluteTime = h.hitObject!.endTime + timeOffset;
      }
    });
  }

  missForcefully() {
    this.applyResult(r => r.type = HitResult.Miss);
  }

  protected override applyResult(apply: (result: JudgementResult, hitObject: this) => void, position?: Vec2) {
    super.applyResult((result, hitObject) => {
      apply(result, hitObject);

      result.position = position ?? this.hitObject!.stackedEndPosition.clone();
    });
  }

  override get hitObject() {
    return super.hitObject as T | undefined;
  }

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.#dependencies.provide(DrawableOsuHitObject, this);

    this.addInternal(this.drawableHitSound);
  }

  protected override playSamples() {
    if (!this.result)
      return;

    this.drawableHitSound.play();
  }

  protected override onApplied() {
    super.onApplied();

    this.positionBindable.bindTo(this.hitObject!.positionBindable);
    this.stackHeightBindable.bindTo(this.hitObject!.stackHeightBindable);
    this.scaleBindable.bindTo(this.hitObject!.scaleBindable);
    this.indexInComboBindable.bindTo(this.hitObject!.indexInComboBindable);
    this.accentColor.bindTo(this.hitObject!.comboColorBindable);

    this.drawableHitSound.loadSamples();
  }

  protected override onFreed() {
    this.positionBindable.unbindFrom(this.hitObject!.positionBindable);
    this.stackHeightBindable.unbindFrom(this.hitObject!.stackHeightBindable);
    this.scaleBindable.unbindFrom(this.hitObject!.scaleBindable);
    this.indexInComboBindable.unbindFrom(this.hitObject!.indexInComboBindable);
    this.accentColor.unbindFrom(this.hitObject!.comboColorBindable);
  }

  override get initialLifetimeOffset(): number {
    return this.hitObject!.timePreempt;
  }

  protected override updateComboColor() {
  }

  drawableHitSound = new DrawableHitSound();

  protected getHitSound() {
    return this.hitObject!.hitSound;
  }

  * getHitSamples() {
    const hitObject = this.hitObject!;
    const hitSound = this.getHitSound();

    const samplePoint = this.beatmap.controlPoints.samplePointAt(hitObject.startTime);

    let sampleSet = hitSound.sampleSet;
    if (sampleSet === SampleSet.Auto)
      sampleSet = samplePoint.sampleSet;

    yield new HitSample(
      hitObject.startTime,
      sampleSet,
      SampleType.Normal,
      samplePoint.volume,
      samplePoint.sampleIndex,
    );

    let additionSampleSet = hitSound.additionSampleSet;
    if (additionSampleSet === SampleSet.Auto)
      additionSampleSet = sampleSet;

    for (const sampleType of hitSound.getSampleTypes()) {
      yield new HitSample(
        hitObject.startTime,
        additionSampleSet,
        sampleType,
        samplePoint.volume,
        samplePoint.sampleIndex,
      );
    }
  }
}
