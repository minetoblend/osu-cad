import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beatmap } from './beatmap.entity';

@Injectable()
export class BeatmapService {
  constructor(
    @InjectRepository(Beatmap)
    private readonly beatmapRepository: Repository<Beatmap>,
  ) {}

  async findById(id: string): Promise<Beatmap | null> {
    return this.beatmapRepository.findOneBy({ id });
  }

  async save(beatmap: Beatmap): Promise<Beatmap> {
    return this.beatmapRepository.save(beatmap);
  }
}
