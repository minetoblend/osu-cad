import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantEntity } from './participant.entity';
import { Repository } from 'typeorm';
import { BeatmapEntity } from './beatmap.entity';
import { Action, BeatmapAccess } from '@osucad/common';
import { MapsetEntity } from './mapset.entity';
import { OsuUserEntity } from '../osu/osu-user.entity';

@Injectable()
export class BeatmapPermissionsService {
  constructor(
    @InjectRepository(ParticipantEntity)
    private readonly participantRepository: Repository<ParticipantEntity>,
    @InjectRepository(MapsetEntity)
    private readonly mapsetRepository: Repository<MapsetEntity>,
    @InjectRepository(OsuUserEntity)
    private readonly osuUserRepository: Repository<OsuUserEntity>,
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

  async setAccess(
    beatmap: BeatmapEntity,
    userId: number,
    access: BeatmapAccess,
  ) {
    const participant = await this.participantRepository.findOne({
      where: {
        beatmap: { id: beatmap.id },
        user: { id: userId },
      },
    });

    const user = await this.osuUserRepository.findOneBy({ id: userId });

    if (!user) {
      throw new Error('User not found');
    }

    if (!participant) {
      if (access === BeatmapAccess.None) {
        return;
      }

      await this.participantRepository.insert({
        beatmap,
        user,
        access,
      });
    } else {
      if (access === BeatmapAccess.None) {
        await this.participantRepository.delete(participant.id);
      } else {
        participant.access = access;
        await this.participantRepository.save(participant);
      }
    }

    this.onPermissionChange.emit({
      beatmap,
      user: userId,
      access,
    });
  }

  onPermissionChange = new Action<
    [
      {
        beatmap: BeatmapEntity;
        user: number;
        access: BeatmapAccess;
      },
    ]
  >();

  async getParticipants(beatmap: BeatmapEntity) {
    return this.participantRepository.find({
      where: { beatmap: { id: beatmap.id } },
      relations: ['user'],
    });
  }
}
