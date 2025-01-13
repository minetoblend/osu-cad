import type { SharedStructure } from '@osucad/multiplayer';
import type { HitObject } from '../hitObjects/HitObject';
import type { IBeatmap } from './IBeatmap';
import { SharedStaticObject } from '@osucad/multiplayer';
import { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import { TimingPoint } from '../controlPoints/TimingPoint';
import { maxBy } from '../utils/arrayUtils';
import { BeatmapColors } from './BeatmapColors';
import { BeatmapInfo } from './BeatmapInfo';
import { HitObjectList } from './HitObjectList';
import { BeatmapSerializer } from './serialization/BeatmapSerializer';

export class Beatmap<T extends HitObject = HitObject> extends SharedStaticObject implements IBeatmap<T> {
  static get serializer() {
    return new BeatmapSerializer();
  }

  constructor(
    public beatmapInfo: BeatmapInfo = new BeatmapInfo(),
    public colors = new BeatmapColors(),
    public controlPoints = new ControlPointInfo(),
  ) {
    super();
  }

  readonly hitObjects = new HitObjectList<T>(this);

  get metadata() {
    return this.beatmapInfo.metadata;
  }

  set metadata(value) {
    this.beatmapInfo.metadata = value;
  }

  get difficulty() {
    return this.beatmapInfo.difficulty;
  }

  set difficulty(value) {
    this.beatmapInfo.difficulty = value;
  }

  getMaxCombo(): number {
    // TODO
    return 0;
  }

  preProcess() {
    for (const h of this.hitObjects)
      this.applyDefaultsTo(h);
  }

  applyDefaultsTo(hitObject: HitObject) {
    hitObject.applyDefaults(this.controlPoints, this.difficulty);
  }

  override get childObjects(): readonly SharedStructure<any>[] {
    return [
      this.controlPoints,
      this.hitObjects,
    ];
  }

  static getMostCommonBeatLength(beatmap: IBeatmap<any>) {
    let lastTime: number;

    // The last playable time in the beatmap - the last timing point extends to this time.
    // Note: This is more accurate and may present different results because osu-stable didn't have the ability to calculate slider durations in this context.
    if (!beatmap.hitObjects.length)
      lastTime = beatmap.controlPoints.timingPoints.last?.time ?? 0;
    else
      lastTime = beatmap.hitObjects.last!.endTime;

    const entries = beatmap.controlPoints.timingPoints.items.map((t, i) => {
      if (t.time > lastTime)
        return { beatLength: t.beatLength, duration: 0 };

      // osu-stable forced the first control point to start at 0.
      // This is reproduced here to maintain compatibility around osu!mania scroll speed and song select display.
      const currentTime = i === 0 ? 0 : t.time;
      const nextTime = beatmap.controlPoints.timingPoints.get(i + 1)?.time ?? lastTime;

      return { beatLength: t.beatLength, duration: nextTime - currentTime };
    });

    const grouped = new Map<number, number>();

    for (const entry of entries) {
      let duration = grouped.get(entry.beatLength) ?? 0;

      duration += entry.duration;

      grouped.set(entry.beatLength, duration);
    }

    if (grouped.size === 0)
      return TimingPoint.DEFAULT_BEAT_LENGTH;

    const [beatLength] = maxBy([...grouped.entries()], ([_, duration]) => duration);

    return beatLength;
  }

  clone(): Beatmap<T> {
    return Object.assign(new Beatmap(), this);
  }
}
