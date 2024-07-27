import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BeatmapSnapshotEntity } from './beatmap-snapshot.entity';
import { Repository } from 'typeorm';
import { BeatmapEntity } from './beatmap.entity';
import { Beatmap, BeatmapData } from '@osucad/common';
import { BeatmapMigrator } from './beatmap-migrator';

@Injectable()
export class BeatmapSnapshotService {
  constructor(
    @InjectRepository(BeatmapSnapshotEntity)
    private readonly repository: Repository<BeatmapSnapshotEntity>,
    @InjectRepository(BeatmapEntity)
    private readonly beatmapRepository: Repository<BeatmapEntity>,
  ) {}

  private readonly snapshotCombineThreshold = /* 5 minutes */ 5 * 60 * 1000;

  async createSnapshotFromBeatmap(entity: BeatmapEntity, beatmap: Beatmap) {
    const data: BeatmapData = {
      version: BeatmapMigrator.migrations.length,
      general: beatmap.general,
      audioFilename: beatmap.audioFilename,
      backgroundPath: beatmap.backgroundPath,
      colors: beatmap.colors.map(
        (color) => '#' + color.toString(16).padStart(6, '0'),
      ),
      difficulty: beatmap.difficulty,
      bookmarks: beatmap.bookmarks,
      controlPoints: beatmap.controlPoints.serializeLegacy(),
      hitObjects: beatmap.hitObjects.serialize(),
      hitSounds: beatmap.hitSounds,
      previewTime: beatmap.previewTime,
    };

    return this.createSnapshot(entity, data);
  }

  async createSnapshot(
    beatmap: BeatmapEntity,
    data: BeatmapData,
  ): Promise<BeatmapSnapshotEntity> {
    return this.repository.manager.transaction(async (em) => {
      const existingSnapshot = await this.repository.findOne({
        where: {
          beatmap: {
            id: beatmap.id,
          },
        },
        order: { timestamp: 'DESC' },
      });

      await this.beatmapRepository.update(beatmap.id, {
        previewTime: data.previewTime,
      });

      if (existingSnapshot) {
        const age = Date.now() - existingSnapshot.createDate.getTime();
        if (age < this.snapshotCombineThreshold) {
          existingSnapshot.data = data;
          existingSnapshot.version = data.version ?? 1;
          existingSnapshot.timestamp = new Date();

          await em.save(existingSnapshot);
          return existingSnapshot;
        }
      }

      const snapshot = new BeatmapSnapshotEntity();
      snapshot.beatmap = beatmap;
      snapshot.data = data;
      snapshot.version = data.version ?? 1;

      await em.save(snapshot);
      return snapshot;
    });
  }

  async getLatestSnapshot(
    beatmap: BeatmapEntity,
  ): Promise<BeatmapSnapshotEntity | null> {
    return this.repository.findOne({
      where: {
        beatmap: {
          id: beatmap.id,
        },
      },
      order: { timestamp: 'DESC' },
    });
  }

  async saveSnapshot(snapshot: BeatmapSnapshotEntity) {
    return this.repository.save(snapshot);
  }
}
