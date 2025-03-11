import type { Provider } from 'nconf';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { RulesetStore, StableBeatmapParser } from '@osucad/core';
import { type OsuBeatmap, OsuRuleset } from '@osucad/ruleset-osu';

export class BeatmapService {
  static async create(config: Provider): Promise<BeatmapService> {
    const directory = config.get('storage') as string;

    RulesetStore.register(new OsuRuleset().rulesetInfo);

    const beatmapPath = resolve(directory, await readdir(directory).then(files => files.find(it => it.endsWith('.osu'))!));

    const content = await readFile(beatmapPath, 'utf-8');

    const beatmap = new StableBeatmapParser().parse(content);

    const osuBeatmap = new OsuRuleset().createBeatmapConverter(beatmap as any).convert();

    const { metadata, difficultyName } = osuBeatmap.beatmapInfo;

    console.log(`Loaded beatmap ${metadata.artist} - ${metadata.title} [${difficultyName}]`);

    return new BeatmapService(osuBeatmap as OsuBeatmap);
  }

  constructor(
    readonly beatmap: OsuBeatmap,
  ) {
  }
}
