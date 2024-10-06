import type { IVec2, ValueChangedEvent } from 'osucad-framework';
import type { BeatmapDifficultyInfo } from '../BeatmapDifficultyInfo';
import type { ControlPointInfo } from '../timing/ControlPointInfo';
import { Action, Comparer, SortedList } from 'osucad-framework';
import { objectId } from '../ObjectId';
import { HitObjectProperty } from './HitObjectProperty';
import { HitWindows } from './HitWindows.ts';
import { hasComboInformation } from './IHasComboInformation';

export abstract class HitObject {
  static readonly control_point_leniency = 1;

  static readonly COMPARER = new class extends Comparer<HitObject> {
    compare(a: HitObject, b: HitObject) {
      return a.startTime - b.startTime;
    }
  }();

  timePreempt = 600;

  timeFadeIn = 400;

  id = objectId();

  readonly defaultsApplied = new Action<HitObject>();

  readonly #startTime = new HitObjectProperty(this, 'startTime', 0);

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

    this.startTimeBindable.valueChanged.removeListener(this.onStartTimeChanged);

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
  };

  changed = new Action<HitObjectChangeEvent>();

  abstract isVisibleAtTime(time: number): boolean;

  contains(position: IVec2): boolean {
    return false;
  }

  isSelected = false;
}

export interface HitObjectChangeEvent {
  hitObject: HitObject;
  propertyName: string;
}
