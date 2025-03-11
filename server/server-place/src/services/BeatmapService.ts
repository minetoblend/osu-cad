import type { Provider } from 'nconf';
import { RulesetStore } from '@osucad/core';
import { OsuRuleset } from '@osucad/ruleset-osu';

export class BeatmapService {
  static create(config: Provider): BeatmapService {
    const beatmapPath = config.get('storage') as string;

    RulesetStore.register(new OsuRuleset().rulesetInfo);

    return new BeatmapService();
  }
}
