import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapsetEntity } from '../beatmap/mapset.entity';

@Injectable()
export class AssetQuotaService {
  constructor(
    @InjectRepository(MapsetEntity)
    private readonly mapsetRepository: Repository<MapsetEntity>,
  ) {}

  async getTotalStorageUsed(userId: number): Promise<number> {
    const result = await this.mapsetRepository
      .createQueryBuilder('mapset')
      .leftJoin('mapset.assets', 'asset')
      .leftJoin('asset.asset', 's3asset')
      .select('SUM(s3asset.fileSize)', 'total')
      .where('mapset.creatorId = :userId', { userId })
      .getRawOne();

    return parseInt(result.total, 10) || 0;
  }

  async getQuotaInfo(userId: number) {
    const total = 1024 * 1024 * 1024 * 2; // 2GB
    const used = await this.getTotalStorageUsed(userId);
    return {
      total,
      used,
      remaining: total - used,
    };
  }
}
