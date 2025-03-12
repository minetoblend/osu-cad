import type { Beatmap } from '@osucad/core';
import type { IMutation, IOpMessage } from '@osucad/multiplayer';
import type { Provider } from 'nconf';
import { readdir, readFile } from 'node:fs/promises';

import { resolve } from 'node:path';
import { BoxedBeatmap, RulesetStore, StableBeatmapParser } from '@osucad/core';
import { UpdateHandler } from '@osucad/multiplayer';
import { OsuRuleset } from '@osucad/ruleset-osu';

export class BeatmapService {
  static async create(config: Provider): Promise<BeatmapService> {
    const directory = config.get('storage') as string;

    RulesetStore.register(new OsuRuleset().rulesetInfo);

    const beatmapPath = resolve(directory, await readdir(directory).then(files => files.find(it => it.endsWith('.osu'))!));

    console.log('Loading beatmap');

    const content = await readFile(beatmapPath, 'utf-8');

    const beatmap = new StableBeatmapParser().parse(content);

    const osuBeatmap = new OsuRuleset().createBeatmapConverter(beatmap as any).convert();

    const { metadata, difficultyName } = osuBeatmap.beatmapInfo;

    console.log(`Loaded beatmap ${metadata.artist} - ${metadata.title} [${difficultyName}]`);

    const assets = await readdir(directory).then(files => files.map(filename => ({
      id: filename,
      path: filename,
    })));

    return new BeatmapService(new BoxedBeatmap(osuBeatmap as Beatmap, assets));
  }

  constructor(
    readonly beatmap: BoxedBeatmap,
  ) {
    this.updateHandler.attach(this.beatmap);

    this.updateHandler.commandApplied.addListener(this.commandApplied, this);
  }

  sequenceNumber = 0;

  readonly updateHandler = new UpdateHandler(this.beatmap);

  commandApplied(command: IMutation) {
    console.log('command applied', command);
  }

  handle(command: IOpMessage) {
    this.updateHandler.process({
      type: 'op',
      clientId: 0,
      contents: command,
      sequenceNumber: 0,
    }, true);
  }
}
