import type { ValueChangedEvent } from "@osucad/framework";
import { Action, Bindable } from "@osucad/framework";
import type { BeatmapDifficultyInfo } from "../../beatmaps/BeatmapDifficultyInfo";
import type { IBeatmapTiming } from "../../beatmaps/timing/IBeatmapTiming";

export class HitObject
{
  readonly defaultsApplied = new Action<HitObject>();

  readonly startTimeBindable = new Bindable(0);

  get startTime()
  {
    return this.startTimeBindable.value;
  }

  set startTime(value)
  {
    this.startTimeBindable.value = value;
  }

  get duration()
  {
    return 0;
  }

  get endTime()
  {
    return this.startTime + this.duration;
  }

  #nestedHitObjects: HitObject[] = [];

  get nestedHitObjects(): readonly HitObject[]
  {
    return this.#nestedHitObjects;
  }

  public applyDefaults(difficulty: BeatmapDifficultyInfo, timing: IBeatmapTiming)
  {
    this.applyDefaultsToSelf(difficulty, timing);

    if (this.#nestedHitObjects.length > 0)
      this.#nestedHitObjects = [];

    this.createNestedHitObjects();

    this.#nestedHitObjects.sort(compareStartTime);

    for (const h of this.#nestedHitObjects)
      h.applyDefaults(difficulty, timing);

    this.startTimeBindable.valueChanged.removeListener(this.#onStartTimeChanged, this);
    this.startTimeBindable.valueChanged.addListener(this.#onStartTimeChanged, this);

    this.defaultsApplied.emit(this);
  }

  protected applyDefaultsToSelf(difficulty: BeatmapDifficultyInfo, timing: IBeatmapTiming)
  {
  }

  protected createNestedHitObjects()
  {
  }

  protected addNested(hitObject: HitObject)
  {
    this.#nestedHitObjects.push(hitObject);
  }

  #onStartTimeChanged(time: ValueChangedEvent<number>)
  {
    const offset = time.value - time.previousValue;

    for(const h of this.#nestedHitObjects)
      h.startTime += offset;
  }
}


function compareStartTime(a: HitObject, b: HitObject)
{
  return a.startTime - b.startTime;
}
