import type { ValueChangedEvent } from "@osucad/framework";
import { Action, Bindable } from "@osucad/framework";
import type { DDSAttributes, ObjectDDSPropertyMetadata } from "@osucad/multiplayer-core";
import { ObjectDDS, type } from "@osucad/multiplayer-core";
import type { HitSampleInfo } from "../../audio/HitSampleInfo";
import { HitSoundInfo } from "../../audio/HitSoundInfo";
import type { ControlPointInfo } from "../../beatmaps";
import type { BeatmapDifficultyInfo } from "../../beatmaps/BeatmapDifficultyInfo";
import { bindableBacked } from "../../utils/bindableBacked";
import { customType } from "../../utils/decorator";
import { Judgement } from "../judgements/Judgement";
import { HitResult } from "../scoring";
import { HitWindows } from "../scoring/HitWindows";
import type { HitObjectInivalidationType, HitObjectInvalidations } from "./invalidations";
import { getInvalidations, invalidations } from "./invalidations";

@invalidations({
  startTime: ["applyDefaults", "combo"],
  hitSound: ["applyDefaults"],
})
export class HitObject extends ObjectDDS
{
  protected readonly invalidations: HitObjectInvalidations<this>;

  uid = 0;

  constructor(attributes: DDSAttributes)
  {
    super(attributes);

    this.invalidations = getInvalidations(this);
  }

  readonly defaultsApplied = new Action<HitObject>();

  readonly invalidated = new Action<[HitObject, HitObjectInivalidationType]>();

  readonly startTimeBindable = new Bindable(0);

  @type("float64")
  @bindableBacked("startTimeBindable")
  accessor startTime!: number;

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

  public applyDefaults(
    difficulty: BeatmapDifficultyInfo,
    controlPoints: ControlPointInfo,
  )
  {
    this.applyDefaultsToSelf(difficulty, controlPoints);

    this.samplesBindable.value = this.createSamples(controlPoints);

    if (this.#nestedHitObjects.length > 0)
      this.#nestedHitObjects = [];

    this.createNestedHitObjects();

    this.#nestedHitObjects.sort(compareStartTime);

    for (const h of this.#nestedHitObjects)
      h.applyDefaults(difficulty, controlPoints);

    this.startTimeBindable.valueChanged.removeListener(
        this.#onStartTimeChanged,
        this,
    );
    this.startTimeBindable.valueChanged.addListener(
        this.#onStartTimeChanged,
        this,
    );

    this.defaultsApplied.emit(this);
  }

  protected applyDefaultsToSelf(
    difficulty: BeatmapDifficultyInfo,
    controlPoints: ControlPointInfo,
  )
  {
    this.hitWindows ??= this.createHitWindows();
    this.hitWindows.setDifficulty(difficulty.overallDifficulty);
  }

  protected createNestedHitObjects()
  {}

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

  @customType("hitSoundInfo")
  @bindableBacked("hitSoundBindable")
  accessor hitSound!: HitSoundInfo;

  readonly samplesBindable = new Bindable<HitSampleInfo[]>([]);

  get samples()
  {
    return this.samplesBindable.value;
  }

  protected createSamples(controlPoints: ControlPointInfo): HitSampleInfo[]
  {
    return this.hitSound.getSamples(this.startTime, controlPoints);
  }

  protected override onPropertyChanged(
    property: ObjectDDSPropertyMetadata,
    newValue: unknown,
    oldValue: unknown,
    local: boolean,
  ): void
  {
    super.onPropertyChanged(property, newValue, oldValue, local);

    const invalidations = this.invalidations[property.name as keyof this];
    if (invalidations)
    {
      for (const invalidation of invalidations)
        this.invalidated.emit(this, invalidation);
    }
  }
}

function compareStartTime(a: HitObject, b: HitObject)
{
  return a.startTime - b.startTime;
}
