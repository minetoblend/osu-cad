import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MapsetEntity } from './mapset.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BeatmapService } from './beatmap.service';

@Injectable()
export class MapsetService {
  constructor(
    @InjectRepository(MapsetEntity)
    private readonly repository: Repository<MapsetEntity>,
    private readonly beatmapService: BeatmapService,
  ) {}

  private async findOne(where: FindOptionsWhere<MapsetEntity>) {
    return this.repository.findOne({
      where: {
        deleted: false,
        ...where,
      },
      relations: ['creator', 'beatmaps'],
    });
  }

  async findById(id: string): Promise<MapsetEntity> {
    return this.findOne({ id });
  }

  async findByCreatorId(creatorId: number): Promise<MapsetEntity[]> {
    return this.repository.find({
      where: {
        creator: {
          id: creatorId,
        },
      },
      relations: ['creator', 'beatmaps', 'beatmaps.audioFile'],
    });
  }

  async exists(id: string) {
    return (await this.repository.countBy({ id })) > 0;
  }

  async create(mapset: MapsetEntity) {
    mapset = await this.repository.save(mapset);

    for (const beatmap of mapset.beatmaps) {
      beatmap.mapset = mapset;
      await this.beatmapService.save(beatmap);
      await this.beatmapService.markAccessed(beatmap, mapset.creator);
    }

    return mapset;
  }

  async save(mapset: MapsetEntity) {
    await this.repository.save(mapset);
  }
}
