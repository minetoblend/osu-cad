import { Module } from '@nestjs/common';
import { s3ClientProvider } from './s3.client';
import { AssetsService } from './assets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3AssetEntity } from './s3-asset.entity';
import { AssetEntity } from './asset.entity';
import { MapsetMigratorService } from './mapset-migrator.service';
import { MapsetEntity } from '../beatmap/mapset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetEntity, S3AssetEntity, MapsetEntity]),
  ],
  providers: [s3ClientProvider, AssetsService, MapsetMigratorService],
  exports: [AssetsService],
})
export class AssetsModule {}
