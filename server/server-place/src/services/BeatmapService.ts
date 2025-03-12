import type { Beatmap } from '@osucad/core';
import type { Provider } from 'nconf';
import type { DataSource } from 'typeorm';

import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BoxedBeatmap, RulesetStore, StableBeatmapParser } from '@osucad/core';
import { OsuRuleset } from '@osucad/ruleset-osu';
import { BeatmapSnapshot } from '../entities/BeatmapSnapshot';

export class BeatmapService {
  constructor(
    readonly db: DataSource,
  ) {
  }

  readonly repository = this.db.getRepository(BeatmapSnapshot);

  beatmap!: BoxedBeatmap;

  async init(config: Provider) {
    RulesetStore.register(new OsuRuleset().rulesetInfo);

    const [snapshot] = await this.repository.find({ order: { id: 'desc' }, take: 1 });

    if (!snapshot) {
      const directory = config.get('storage') as string;
      const beatmapPath = resolve(directory, await readdir(directory).then(files => files.find(it => it.endsWith('.osu'))!));

      console.log('Initializing beatmap');

      const content = await readFile(beatmapPath, 'utf-8');

      const beatmap = new StableBeatmapParser().parse(content);

      const osuBeatmap = new OsuRuleset().createBeatmapConverter(beatmap as any).convert();

      const { metadata, difficultyName } = osuBeatmap.beatmapInfo;

      console.log(`Loaded beatmap ${metadata.artist} - ${metadata.title} [${difficultyName}]`);

      const assets = await readdir(directory).then(files => files.map(filename => ({
        id: filename,
        path: filename,
      })));

      this.beatmap = new BoxedBeatmap(osuBeatmap as Beatmap, assets);

      await this.repository.insert({
        data: JSON.stringify(this.beatmap.createSummary()),
        timestamp: Date.now(),
      });
    }
    else {
      console.log('Resuming from latest beatmap snapshot');
      this.beatmap = new BoxedBeatmap();
      this.beatmap.initializeFromSummary(JSON.parse(snapshot.data));

      const { metadata, difficultyName } = this.beatmap.beatmap!.beatmapInfo;

      console.log(`Loaded beatmap ${metadata.artist} - ${metadata.title} [${difficultyName}]`);
    }
  }
}
