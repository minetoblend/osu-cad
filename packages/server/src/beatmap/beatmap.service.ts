import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MapsetEntity } from './mapset.entity';
import { Repository } from 'typeorm';
import { BeatmapEntity } from './beatmap.entity';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import { ParticipantEntity } from './participant.entity';
import { Action, BeatmapAccess, BeatmapData } from '@osucad/common';
import { UserEntity } from '../users/user.entity';
import { EditorSessionEntity } from '../editor/editor-session.entity';
import { BeatmapSnapshotService } from './beatmap-snapshot.service';

@Injectable()
export class BeatmapService {
  constructor(
    @InjectRepository(MapsetEntity)
    private readonly mapsetRepository: Repository<MapsetEntity>,
    @InjectRepository(BeatmapEntity)
    private readonly beatmapRepository: Repository<BeatmapEntity>,
    @InjectRepository(ParticipantEntity)
    private readonly participantRepository: Repository<ParticipantEntity>,
    @InjectRepository(EditorSessionEntity)
    private readonly sessionRepository: Repository<EditorSessionEntity>,
    private readonly snapshotService: BeatmapSnapshotService,
  ) {}

  async createMapset(mapset: MapsetEntity) {
    mapset = await this.mapsetRepository.save(mapset);
    for (const beatmap of mapset.beatmaps) {
      beatmap.mapset = mapset;
      await this.beatmapRepository.save(beatmap);
    }

    return mapset;
  }

  async saveMapset(mapset: MapsetEntity) {
    return await this.mapsetRepository.save(mapset);
  }

  async findMapsetById(id: string) {
    return await this.mapsetRepository.findOne({
      where: { id },
      relations: ['creator', 'beatmaps'],
    });
  }

  async findBeatmapById(id: number) {
    return await this.beatmapRepository.findOne({
      where: { id },
      relations: ['mapset'],
    });
  }

  async findBeatmapByUuid(uuid: string) {
    return await this.beatmapRepository.findOne({
      where: { uuid },
      relations: ['mapset', 'mapset.creator'],
    });
  }

  async findBeatmapByShareKey(shareId: string) {
    return await this.beatmapRepository.findOne({
      where: { shareId },
      relations: ['mapset'],
    });
  }

  async mapsetExists(id: string) {
    return await this.mapsetRepository.exist({
      where: {
        id,
      },
    });
  }

  getFileContents(id: string, filePath: string): Buffer | null {
    filePath = path.join('files/mapsets', id, filePath);
    if (!existsSync(filePath)) return null;

    const relative = path.relative('files/mapsets', filePath);
    if (relative.startsWith('..') || path.isAbsolute(filePath)) return null;

    return readFileSync(filePath);
  }

  findMapsetsByCreator(id: number) {
    return this.mapsetRepository.find({
      where: {
        creator: { id },
      },
      relations: ['creator', 'beatmaps'],
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async save(beatmap: BeatmapEntity, data: BeatmapData) {
    await this.snapshotService.createSnapshot(beatmap, data);
  }

  findLastEditedBeatmaps(user: UserEntity) {
    return this.sessionRepository
      .createQueryBuilder('session')
      .innerJoinAndSelect('session.beatmap', 'beatmap')
      .innerJoinAndSelect('beatmap.mapset', 'mapset')
      .innerJoinAndSelect('mapset.creator', 'creator')
      .where({ user })
      .distinctOn(['beatmap.id'])
      .orderBy('session.endDate', 'DESC')
      .limit(10)
      .getMany();
  }

  async setAccess(beatmap: BeatmapEntity, access: BeatmapAccess) {
    await this.beatmapRepository.update(beatmap.id, {
      access,
    });
    beatmap.access = access;
    this.onAccessChange.emit({ beatmap, access });
  }

  readonly onAccessChange = new Action<
    [{ beatmap: BeatmapEntity; access: BeatmapAccess }]
  >();
}
