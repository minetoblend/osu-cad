import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { BeatmapEntity } from './beatmap.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BeatmapThumbnailJob } from './beatmap-thumbnail.processor';
import { BeatmapLastAccessEntity } from './beatmap-last-access.entity';
import { UserEntity } from '../users/user.entity';
import { BeatmapSnapshotService } from './beatmap-snapshot.service';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class BeatmapService implements OnModuleInit {
  constructor(
    @InjectRepository(BeatmapEntity)
    private readonly repository: Repository<BeatmapEntity>,
    @InjectRepository(BeatmapLastAccessEntity)
    private readonly lastAccessRepository: Repository<BeatmapLastAccessEntity>,
    private readonly snapshotService: BeatmapSnapshotService,
    private readonly assetService: AssetsService,
    @InjectQueue('beatmap-thumbnail')
    private readonly thumbnailQueue: Queue<BeatmapThumbnailJob>,
  ) {}

  async onModuleInit(): Promise<void> {
    this.updateBeatmapAudioFile();

    const beatmaps = await this.repository.find({
      select: ['id'],
      where: {
        needsThumbnail: true,
      },
    });
    this.logger.log(
      `Queuing ${beatmaps.length} beatmaps for thumbnail generation`,
    );
    for (const beatmap of beatmaps) {
      await this.queueThumbnailJob(beatmap);
    }
  }

  private readonly logger = new Logger(BeatmapService.name);

  private async findOne(where: FindOptionsWhere<BeatmapEntity>) {
    return this.repository.findOne({
      where: {
        deleted: false,
        ...where,
      },
      relations: [
        'mapset',
        'mapset.creator',
        'thumbnailLarge',
        'thumbnailSmall',
      ],
    });
  }

  async findById(id: number): Promise<BeatmapEntity> {
    return this.findOne({ id });
  }

  async findByUuid(uuid: string): Promise<BeatmapEntity> {
    return this.findOne({ uuid });
  }

  async findByShareId(shareId: string): Promise<BeatmapEntity> {
    return this.findOne({ shareId });
  }

  async updateBeatmap(
    beatmap: BeatmapEntity,
    update: QueryDeepPartialEntity<BeatmapEntity>,
  ) {
    await this.repository.update(beatmap.id, update);
  }

  async getBeatmaps(
    userId: number,
    filter: 'all' | 'own' | 'shared-with-me',
    sort: 'artist' | 'title' | 'recent',
    search?: string,
  ) {
    const query = this.repository
      .createQueryBuilder('beatmap')
      .leftJoin(
        'beatmap.lastAccess',
        'lastAccess',
        'beatmap.id = lastAccess.beatmapId and lastAccess.userId = :userId',
      )
      .innerJoinAndSelect('beatmap.mapset', 'mapset')
      .innerJoinAndSelect('mapset.creator', 'creator')
      .andWhere('beatmap.deleted = false');

    if (filter === 'all') {
      query.leftJoin('beatmap.participants', 'participant').andWhere(
        `
        (
          creator.id = :userId OR
          (beatmap.access > 0 AND lastAccess.date IS NOT NULL) OR
          (participant.user.id = :userId AND participant.access > 0)
        )
      `,
        { userId },
      );
    } else if (filter === 'own') {
      query.andWhere('creator.id = :userId', { userId });
    } else if (filter === 'shared-with-me') {
      query
        .leftJoin('beatmap.participants', 'participant')
        .andWhere('creator.id != :userId', { userId })
        .andWhere(
          `
        (
          (participant.user.id = :userId AND participant.access > 0)
        )`,
          { userId },
        );
    }

    if (search && search.length > 0) {
      query.andWhere(
        '(mapset.artist LIKE :search OR mapset.title LIKE :search OR beatmap.name LIKE :search OR creator.username LIKE :search)',
        { search: `%${search}%` },
      );
    }

    switch (sort) {
      case 'artist':
        query.orderBy('mapset.artist', 'ASC');
        break;
      case 'title':
        query.orderBy('mapset.title', 'ASC');
        break;
      case 'recent':
        query.orderBy('lastAccess.date', 'DESC');
        break;
    }

    return await query.limit(200).getMany();
  }

  markAccessed(beatmap: BeatmapEntity, user: UserEntity) {
    return this.lastAccessRepository
      .createQueryBuilder()
      .insert()
      .into(BeatmapLastAccessEntity)
      .values({
        beatmapId: beatmap.id,
        userId: user.id,
        date: new Date(),
      })
      .orUpdate(['date'])
      .execute();
  }

  async queueThumbnailJob(beatmap: BeatmapEntity) {
    return this.thumbnailQueue.add(
      { beatmapId: beatmap.id },
      {
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );
  }

  async save(beatmap: BeatmapEntity) {
    return await this.repository.save(beatmap);
  }

  async delete(beatmap: BeatmapEntity) {
    beatmap.deleted = true;
    return await this.repository.save(beatmap);
  }

  async updateBeatmapAudioFile() {
    const beatmaps = await this.repository.find({
      where: {
        audioFile: IsNull(),
      },
      relations: ['mapset'],
    });

    for (const beatmap of beatmaps) {
      console.log(
        'Updating audio file for beatmap',
        `${beatmap.mapset.title} - ${beatmap.mapset.artist} [${beatmap.name}]`,
      );
      const snapshot = await this.snapshotService.getLatestSnapshot(beatmap);

      const audioFilename = snapshot.data.audioFilename;

      const asset = await this.assetService.getAsset(
        beatmap.mapset,
        audioFilename,
      );

      console.log(!!asset);

      if (asset) {
        beatmap.audioFile = asset.asset;
        await this.save(beatmap);
      }
    }
  }
}
