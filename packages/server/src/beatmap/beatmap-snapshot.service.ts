import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BeatmapSnapshotEntity } from './beatmap-snapshot.entity';
import { Repository } from 'typeorm';
import { BeatmapEntity } from './beatmap.entity';
import { BeatmapData } from '@osucad/common';

@Injectable()
export class BeatmapSnapshotService {
  constructor(
    @InjectRepository(BeatmapSnapshotEntity)
    private readonly repository: Repository<BeatmapSnapshotEntity>,
  ) {}

  private readonly snapshotCombineThreshold = /* 5 minutes */ 5 * 60 * 1000;

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

      if (existingSnapshot) {
        const age = Date.now() - existingSnapshot.timestamp.getTime();
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
}
