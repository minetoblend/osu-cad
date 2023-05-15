import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  BeatmapColors,
  BeatmapColorsFactory,
  BeatmapDifficulty,
  BeatmapDifficultyFactory,
  BetamapMetadata,
  BetamapMetadataFactory,
  CircleFactory,
  HitObjectCollection,
  HitObjectCollectionFactory,
  TimingPoint,
  TimingPointCollection,
  TimingPointCollectionFactory,
  TimingPointFactory,
  SliderFactory,
  ControlPointListFactory,
} from '@osucad/common';
import { Document } from '@osucad/unison';
import { UnisonServer, UnisonServerRuntime } from '@osucad/unison-server';
import { Server } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { BeatmapService } from '../beatmap/beatmap.service';
import { Beatmap } from '../beatmap/beatmap.entity';
@Injectable()
export class EditorUnisonService {
  private servers = new Map<string, UnisonServer>();
  private pendingSession = new Map<string, Promise<UnisonServer>>();
  private logger = new Logger(EditorUnisonService.name);

  constructor(private beatmapService: BeatmapService) {}

  private async createSession(
    documentId: string,
    io: Server,
  ): Promise<UnisonServer> {
    const pending = this.pendingSession.get(documentId);
    if (pending) {
      return await pending;
    }
    const sessionP = this.createSessionInternal(documentId, io);
    this.pendingSession.set(documentId, sessionP);
    const session = await sessionP;
    this.servers.set(documentId, session);
    this.pendingSession.delete(documentId);
    return session;
  }

  private async createSessionInternal(
    documentId: string,
    io: Server,
  ): Promise<UnisonServer> {
    const beatmap = await this.beatmapService.findById(documentId);
    if (!beatmap) {
      throw new Error('Beatmap not found');
    }

    const document = this.createDocumentFromBeatmap(beatmap);

    return new UnisonServer(uuid(), document, io);
  }

  async getSession(documentId: string, io: Server): Promise<UnisonServer> {
    const existing = this.servers.get(documentId);
    if (existing) {
      return existing;
    }
    return this.createSession(documentId, io);
  }

  @Cron('0 */10 * * * *')
  async cleanupSessions() {
    this.logger.log('Cleaning up sessions');
    [...this.servers.entries()].forEach(([documentId, session]) => {
      if (session.clientCount === 0) {
        this.servers.delete(documentId);
        this.logger.log(`Deleted session for ${documentId}`);
      }
    });
  }

  @Cron('*/30 * * * * *')
  async saveBeatmaps() {
    this.logger.log('Saving beatmaps');
    [...this.servers.entries()]
      .filter(([_, session]) => session.isDirty)
      .forEach(async ([documentId, session]) => {
        const beatmap = await this.beatmapService.findById(documentId);
        if (!beatmap) return;

        this.logger.log(
          `Saving beatmap (${beatmap.id}):  ${beatmap.artist} - ${beatmap.title} `,
        );

        const { hitObjects, timing, difficulty, colors } =
          session.createSnapshot();

        beatmap.hitObjects = hitObjects;
        beatmap.timing = timing;
        beatmap.colors = colors;

        beatmap.difficulty.hpDrainRate = difficulty.hpDrainRate;
        beatmap.difficulty.circleSize = difficulty.circleSize;
        beatmap.difficulty.approachRate = difficulty.approachRate;
        beatmap.difficulty.overallDifficulty = difficulty.overallDifficulty;
        beatmap.difficulty.sliderMultiplier = difficulty.sliderMultiplier;

        session.isDirty = false;

        await this.beatmapService.save(beatmap);
      });
  }

  createRuntime() {
    return new UnisonServerRuntime([
      new TimingPointCollectionFactory(),
      new TimingPointFactory(),
      new BetamapMetadataFactory(),
      new HitObjectCollectionFactory(),
      new CircleFactory(),
      new SliderFactory(),
      new BeatmapDifficultyFactory(),
      new BeatmapColorsFactory(),
      new ControlPointListFactory(),
    ]);
  }

  createDocumentFromBeatmap(beatmap: Beatmap) {
    const runtime = this.createRuntime();
    const document = this.createEmptyDocument(runtime);

    if (beatmap.data) document.restore(beatmap.data);

    const { metadata, timing, hitObjects, colors, difficulty } =
      document.objects;

    metadata.artist = beatmap.artist;
    metadata.artistUnicode = beatmap.artistUnicode;
    metadata.title = beatmap.title;
    metadata.titleUnicode = beatmap.titleUnicode;

    if (beatmap.hitObjects) hitObjects.restore(beatmap.hitObjects);
    if (beatmap.timing) timing.restore(beatmap.timing);
    if (beatmap.colors) colors.restore(beatmap.colors);

    difficulty.hpDrainRate = beatmap.difficulty.hpDrainRate;
    difficulty.circleSize = beatmap.difficulty.circleSize;
    difficulty.approachRate = beatmap.difficulty.approachRate;
    difficulty.overallDifficulty = beatmap.difficulty.overallDifficulty;
    difficulty.sliderMultiplier = beatmap.difficulty.sliderMultiplier;

    return document;
  }

  createEmptyDocument(runtime: UnisonServerRuntime) {
    const document = new Document(runtime, {
      metadata: new BetamapMetadata(runtime),
      timing: new TimingPointCollection(runtime),
      hitObjects: new HitObjectCollection(runtime),
      difficulty: new BeatmapDifficulty(runtime),
      colors: new BeatmapColors(runtime),
    });

    return document;
  }
}
