import type { HitObject, IBeatmap, Ruleset } from '@osucad/core';
import { BeatmapConverter, ConvertCircle, ConvertHoldNote, hasXPosition } from '@osucad/core';
import { clamp } from '@osucad/framework';
import { ManiaBeatmap } from './beatmaps/ManiaBeatmap';
import { StageDefinition } from './beatmaps/StageDefinition';
import { ManiaRuleset } from './ManiaRuleset';
import { HoldNote } from './objects/HoldNote';
import { ManiaHitObject } from './objects/ManiaHitObject';
import { Note } from './objects/Note';

export class ManiaBeatmapConverter extends BeatmapConverter<ManiaHitObject> {
  constructor(beatmap: IBeatmap, ruleset: Ruleset) {
    super(beatmap, ruleset);

    this.columnCount = beatmap.difficulty.circleSize;
  }

  readonly columnCount: number;

  override canConvert(): boolean {
    return this.beatmap.hitObjects.items.every(it => hasXPosition(it));
  }

  protected override createBeatmap(): IBeatmap<ManiaHitObject> {
    return new ManiaBeatmap(new StageDefinition(this.columnCount));
  }

  protected override * convertHitObject(hitObject: HitObject, original: IBeatmap): Generator<ManiaHitObject, void, undefined> {
    if (hitObject instanceof ManiaHitObject) {
      yield hitObject;
    }

    if (original.beatmapInfo.ruleset?.shortName === new ManiaRuleset().shortName) {
      if (hitObject instanceof ConvertCircle) {
        const column = clamp(Math.floor(hitObject.position.x * this.columnCount / 512), 0, this.columnCount - 1);

        const note = new Note();
        note.startTime = hitObject.startTime;
        note.column = column;
        yield note;
      }
      if (hitObject instanceof ConvertHoldNote) {
        const column = clamp(Math.floor(hitObject.position.x * this.columnCount / 512), 0, this.columnCount - 1);

        const note = new HoldNote();
        note.startTime = hitObject.startTime;
        note.endTime = hitObject.endTime;
        note.column = column;
        yield note;
      }
    }
  }
}
