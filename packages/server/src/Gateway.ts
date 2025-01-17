import type { OsuBeatmap } from '@osucad/ruleset-osu';
import type { Server } from 'socket.io';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { RulesetStore, StableBeatmapParser } from '@osucad/core';
import { OsuRuleset } from '@osucad/ruleset-osu';
import { getAssets } from './assets';
import { Room } from './multiplayer/Room';

const beatmapFilePath = './beatmap/Suzukaze Aoba (CV. Yuki Takada) - Rainbow Days!! (Maarvin) [Expert].osu';

export class Gateway {
  constructor(readonly io: Server) {
  }

  room!: Room;

  async init() {
    RulesetStore.register(new OsuRuleset().rulesetInfo);

    const conversionBeatmap = new StableBeatmapParser().parse(await fs.readFile(beatmapFilePath, 'utf-8'));

    const beatmap = new OsuRuleset().createBeatmapConverter(conversionBeatmap as any).convert() as OsuBeatmap;

    const roomId = randomUUID();

    this.room = new Room(
      roomId,
      this.io.to(roomId),
      beatmap,
      getAssets(),
    );

    this.io.on('connect', socket => this.room.accept(socket));
  }
}
