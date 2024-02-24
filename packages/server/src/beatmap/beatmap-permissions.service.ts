import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantEntity } from './participant.entity';
import { Repository } from 'typeorm';
import { BeatmapEntity } from './beatmap.entity';
import { Action, BeatmapAccess } from '@osucad/common';
import { MapsetEntity } from './mapset.entity';

@Injectable()
export class BeatmapPermissionsService {
  constructor(
    @InjectRepository(ParticipantEntity)
    private readonly participantRepository: Repository<ParticipantEntity>,
    @InjectRepository(MapsetEntity)
    private readonly mapsetRepository: Repository<MapsetEntity>,
  ) {}

  public async getAccess(
    beatmap: BeatmapEntity,
    userId: number,
  ): Promise<BeatmapAccess> {
    const mapset = await this.mapsetRepository.findOne({
      where: { beatmaps: { id: beatmap.id } },
      relations: ['creator'],
    });

    if (!mapset) {
      throw new Error('Mapset not found');
    }

    if (mapset.creator.id === userId) {
      return BeatmapAccess.MapsetOwner;
    }

    const participant = await this.participantRepository.findOne({
      where: {
        beatmap: { id: beatmap.id },
        user: { id: userId },
      },
    });

    if (!participant) {
      return beatmap.access;
    }

    return Math.max(participant.access, beatmap.access);
  }

  async setAccess(beatmap: BeatmapEntity, user: number, access: BeatmapAccess) {
    const participant = await this.participantRepository.findOne({
      where: {
        beatmap: { id: beatmap.id },
        user: { id: user },
      },
    });

    if (!participant) {
      await this.participantRepository.insert({
        beatmap,
        user: { id: user },
        access,
      });
    } else {
      participant.access = access;
      await this.participantRepository.save(participant);
    }
  }

  onPermissionChange = new Action<
    [
      {
        beatmap: number;
        user: number;
        access: BeatmapAccess;
      },
    ]
  >();
}
