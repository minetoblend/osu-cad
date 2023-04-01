import {
  BeatmapColors,
  BeatmapColorsFactory,
  BeatmapDifficulty,
  BeatmapDifficultyFactory,
  BetamapMetadata,
  BetamapMetadataFactory,
  Circle,
  CircleFactory,
  HitObjectCollection,
  HitObjectCollectionFactory,
  TimingPoint,
  TimingPointCollection,
  TimingPointCollectionFactory,
  TimingPointFactory,
} from '@osucad/common';
import { UnisonServer, UnisonServerRuntime } from '@osucad/unison-server';
import { Document } from '@osucad/unison';
import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class EditorUnisonService {
  private servers = new Map<string, UnisonServer>();
  private pendingSession = new Map<string, Promise<UnisonServer>>();
  private logger = new Logger(EditorUnisonService.name);

  private async createSession(documentId: string): Promise<UnisonServer> {
    if (this.pendingSession.has(documentId)) {
      return this.pendingSession.get(documentId)!;
    }
    const sessionP = this.createSessionInternal(documentId);
    this.pendingSession.set(documentId, sessionP);
    const session = await sessionP;
    this.servers.set(documentId, session);
    this.pendingSession.delete(documentId);
    return session;
  }

  private async createSessionInternal(
    documentId: string,
  ): Promise<UnisonServer> {
    const document = this.createEmptyDocument();

    return new UnisonServer(uuid(), document);
  }

  async getSession(documentId: string): Promise<UnisonServer> {
    if (this.servers.has(documentId)) {
      return this.servers.get(documentId)!;
    }
    return this.createSession(documentId);
  }

  @Cron('0 */2 * * * *')
  async cleanupSessions() {
    this.logger.log('Cleaning up sessions');
    [...this.servers.entries()].forEach(([documentId, session]) => {
      if (session.clientCount === 0) {
        this.servers.delete(documentId);
        this.logger.log(`Deleted session for ${documentId}`);
      }
    });
  }

  createEmptyDocument() {
    const runtime = new UnisonServerRuntime([
      new TimingPointCollectionFactory(),
      new TimingPointFactory(),
      new BetamapMetadataFactory(),
      new HitObjectCollectionFactory(),
      new CircleFactory(),
      new BeatmapDifficultyFactory(),
      new BeatmapColorsFactory(),
    ]);
    const document = new Document(runtime, {
      metadata: new BetamapMetadata(runtime),
      timing: new TimingPointCollection(runtime),
      hitObjects: new HitObjectCollection(runtime),
      difficulty: new BeatmapDifficulty(runtime),
      colors: new BeatmapColors(runtime),
    });

    const metadata = document.objects.metadata;
    metadata.artistUnicode = 'quilt heron';
    metadata.titleUnicode = 'Hifumi Daisuki?';

    const timingPoint = new TimingPoint(runtime);
    timingPoint.offset = 114;
    timingPoint.bpm = 161;

    document.objects.timing.insert(timingPoint);

    for (let i = 0; i < 1000; i++) {
      const circle = new Circle(runtime);
      circle.position = {
        x: Math.floor(Math.random() * 512),
        y: Math.floor(Math.random() * 384),
      };
      circle.startTime = 859 + Math.floor((i * timingPoint.beatDuration) / 2);

      if (Math.random() < 0.2) circle.newCombo = true;

      document.objects.hitObjects.insert(circle);
    }

    document.objects.colors.insert(0x32a852);
    document.objects.colors.insert(0x4287f5);
    document.objects.colors.insert(0xf542ec);

    // const circle2 = new Circle(runtime);
    // circle2.position = { x: 200, y: 100 };
    // circle2.startTime = 952;

    // document.objects.hitObjects.insert(circle);
    // document.objects.hitObjects.insert(circle2);

    return document;
  }
}
