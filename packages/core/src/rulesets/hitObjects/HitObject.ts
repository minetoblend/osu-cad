import type { ValueChangedEvent } from "@osucad/framework";
import { Action, Bindable } from "@osucad/framework";
import type { BeatmapDifficultyInfo } from "../../beatmaps/BeatmapDifficultyInfo";
import type { IBeatmapTiming } from "../../beatmaps/timing/IBeatmapTiming";
import { HitWindows } from "../scoring/HitWindows";
import { HitResult } from "../scoring";
import { Judgement } from "../judgements/Judgement";
import { HitSoundInfo } from "../../audio/HitSoundInfo";
import type { HitSampleInfo } from "../../audio/HitSampleInfo";

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

    this.samplesBindable.value = this.createSamples(timing);

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
    this.hitWindows ??= this.createHitWindows();
    this.hitWindows.setDifficulty(difficulty.overallDifficulty);
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

    for (const h of this.#nestedHitObjects)
      h.startTime += offset;
  }


  #judgement: Judgement | null = null;

  get judgement(): Judgement
  {
    this.#judgement ??= this.createJudgement();
    return this.#judgement;
  }

  createJudgement(): Judgement
  {
    return new Judgement();
  }


  hitWindows: HitWindows | null = null;

  protected createHitWindows(): HitWindows
  {
    return new HitWindows();
  }

  get maximumJudgementOffset()
  {
    return this.hitWindows?.windowFor(HitResult.Miss) ?? 0;
  }

  readonly hitSoundBindable = new Bindable<HitSoundInfo>(new HitSoundInfo());

  get hitSound()
  {
    return this.hitSoundBindable.value;
  }

  set hitSound(value: HitSoundInfo)
  {
    this.hitSoundBindable.value = value;
  }

  readonly samplesBindable = new Bindable<HitSampleInfo[]>([]);

  get samples()
  {
    return this.samplesBindable.value;
  }

  protected createSamples(timing: IBeatmapTiming): HitSampleInfo[]
  {
    return this.hitSound.getSamples(this.startTime, timing);
  }
}


function compareStartTime(a: HitObject, b: HitObject)
{
  return a.startTime - b.startTime;
}
