import type { Ruleset } from '@osucad/common';
import type { ManiaHitObject } from '../objects/ManiaHitObject';
import type { StageDefinition } from './StageDefinition';
import { Beatmap, sumBy } from '@osucad/common';
import { ManiaRuleset } from '../ManiaRuleset';

export class ManiaBeatmap extends Beatmap<ManiaHitObject> {
  override get ruleset(): Ruleset | null {
    return new ManiaRuleset();
  }

  stages: StageDefinition[] = [];

  get totalColumns() {
    return sumBy(this.stages, it => it.columns);
  }

  constructor(defaultStage: StageDefinition, originalTotalColumns?: number) {
    super();

    this.stages.push(defaultStage);
  }

  getStageForColumnIndex(column: number) {
    for (const stage of this.stages) {
      if (column < stage.columns)
        return stage;
      column -= stage.columns;
    }

    throw new Error('Provided index exceeds all available stages');
  }
}
