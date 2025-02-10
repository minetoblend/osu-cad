import type { ValueChangedEvent } from '@osucad/framework';
import type { SharedProperty } from '@osucad/multiplayer';
import type { BeatmapDifficultyInfo } from '../beatmap/BeatmapDifficultyInfo';
import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import { Action, Comparer, SortedList } from '@osucad/framework';
import { SharedObject } from '@osucad/multiplayer';

import { Judgement } from '../rulesets/judgements/Judgement';
import { HitResult } from './HitResult';
import { HitWindows } from './HitWindows';
import { hasComboInformation } from './IHasComboInformation';

export abstract class HitObject extends SharedObject {
  static readonly control_point_leniency = 1;

  static readonly COMPARER = new class extends Comparer<HitObject> {
    compare(a: HitObject, b: HitObject) {
      const difference = a.startTime - b.startTime;

      if (difference === 0) {
        return (
          (a.transient ? 1 : 0) - (b.transient ? 1 : 0)
        );
      }

      return difference;
    }
  }();

  readonly needsDefaultsApplied = new Action<HitObject>();

  protected requestApplyDefaults() {
    this.needsDefaultsApplied.emit(this);
  }

  constructor() {
    super();

    this.#startTime = this.property('startTime', 0);
  }

  timePreempt = 600;

  timeFadeIn = 400;

  transient = false;

  readonly defaultsApplied = new Action<HitObject>();

  readonly #startTime: SharedProperty<number>;

  get startTimeBindable() {
    return this.#startTime.bindable;
  }

  get startTime() {
    return this.#startTime.value;
  }

  set startTime(value: number) {
    this.#startTime.value = value;
  }

  get duration() {
    return 0;
  }

  get endTime() {
    return this.startTime + this.duration;
  }

  #nestedHitObjects = new SortedList<HitObject>(HitObject.COMPARER);

  get nestedHitObjects(): ReadonlyArray<HitObject> {
    return this.#nestedHitObjects.items;
  }

  applyDefaults(controlPointInfo: ControlPointInfo, difficulty: BeatmapDifficultyInfo) {
    this.applyDefaultsToSelf(controlPointInfo, difficulty);

    this.#nestedHitObjects.clear();

    this.createNestedHitObjects();
    if (hasComboInformation(this)) {
      for (const h of this.nestedHitObjects) {
        if (hasComboInformation(h)) {
          h.comboIndexBindable.bindTo(this.comboIndexBindable);
          h.indexInComboBindable.bindTo(this.indexInComboBindable);
        }
      }
    }

    for (const h of this.nestedHitObjects)
      h.applyDefaults(controlPointInfo, difficulty);

    this.startTimeBindable.valueChanged.removeListener(this.onStartTimeChanged, this);

    this.startTimeBindable.valueChanged.addListener(this.onStartTimeChanged, this);

    this.defaultsApplied.emit(this);
  }

  #kiai = false;

  get kiai() {
    return this.#kiai;
  }

  hitWindows!: HitWindows;

  protected applyDefaultsToSelf(controlPointInfo: ControlPointInfo, difficulty: BeatmapDifficultyInfo) {
    this.#kiai = controlPointInfo.effectPointAt(this.startTime + HitObject.control_point_leniency).kiaiMode;

    this.hitWindows ??= this.createHitWindows();
    this.hitWindows.setDifficulty(difficulty.overallDifficulty);
  }

  protected createHitWindows() {
    return new HitWindows();
  }

  protected createNestedHitObjects() {
  }

  addNested(hitObject: HitObject) {
    this.#nestedHitObjects.add(hitObject);
  }

  protected onStartTimeChanged(time: ValueChangedEvent<number>) {
    const offset = time.value - time.previousValue;

    for (const nested of this.nestedHitObjects)
      nested.startTime += offset;

    this.requestApplyDefaults();
  }

  abstract isVisibleAtTime(time: number): boolean;

  isSelected = false;

  #judgement?: Judgement;

  get judgement(): Judgement {
    this.#judgement ??= this.createJudgement();
    return this.#judgement;
  }

  createJudgement() {
    return new Judgement();
  }

  get maximumJudgementOffset() {
    return this.hitWindows?.windowFor(HitResult.Miss) ?? 0;
  };
}

export interface HitObjectChangeEvent {
  hitObject: HitObject;
  propertyName: string;
}
