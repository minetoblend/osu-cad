import type { ISummary, MutationContext } from '@osucad/multiplayer';
import type { Beatmap } from '../../beatmap/Beatmap';
import { SharedStructure } from '@osucad/multiplayer';
import { RulesetStore } from '../../rulesets/RulesetStore';

export interface BoxedBeatmapSummary extends ISummary {
  ruleset: string;
  beatmap: any;
}

export class BoxedBeatmap extends SharedStructure<never, BoxedBeatmapSummary> {
  constructor(
    public beatmap?: Beatmap<any>,
  ) {
    super();
  }

  override handle(mutation: never, ctx: MutationContext): void | null {
  }

  get rulesetId() {
    return this.beatmap!.beatmapInfo.ruleset.shortName;
  }

  override createSummary(): BoxedBeatmapSummary {
    return {
      id: this.id,
      ruleset: this.rulesetId,
      beatmap: this.beatmap!.createSummary(),
    };
  }

  override initializeFromSummary(summary: BoxedBeatmapSummary): void {
    const rulesetInfo = RulesetStore.getByShortName(summary.ruleset);
    if (!rulesetInfo || !rulesetInfo.available)
      throw new Error(`Ruleset "${summary.ruleset}" is not supported`);

    const ruleset = rulesetInfo.createInstance();
    const beatmap = this.beatmap = ruleset.createBeatmap();

    beatmap.beatmapInfo.ruleset = rulesetInfo;
    beatmap.initializeFromSummary(summary.beatmap);
  }
}
