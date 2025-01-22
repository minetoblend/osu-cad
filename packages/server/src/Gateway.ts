import type { OsuBeatmap } from '@osucad/ruleset-osu';
import type { Server } from 'socket.io';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { BoxedBeatmap, RulesetStore, StableBeatmapParser } from '@osucad/core';
import { OsuRuleset } from '@osucad/ruleset-osu';
import { getAssets } from './assets';
import { Room } from './multiplayer/Room';
import { OrderingService } from './services/OrderingService';

const beatmapFilePath = './beatmap/Suzukaze Aoba (CV. Yuki Takada) - Rainbow Days!! (Maarvin) [Expert].osu';

export class Gateway {
  constructor(readonly io: Server) {
  }

  room!: Room;

  async init() {
    RulesetStore.register(new OsuRuleset().rulesetInfo);

    const ruleset = new OsuRuleset();

    const conversionBeatmap = new StableBeatmapParser().parse(await fs.readFile(beatmapFilePath, 'utf-8'));

    const beatmap = ruleset.createBeatmapConverter(conversionBeatmap as any).convert() as OsuBeatmap;

    const roomId = randomUUID();

    const orderingService = new OrderingService(new BoxedBeatmap(beatmap).createSummary());

    const broadcast = this.io.to(roomId);

    this.room = new Room(roomId, broadcast, orderingService, getAssets());

    this.io.on('connect', socket => this.room.accept(socket));
  }
}
