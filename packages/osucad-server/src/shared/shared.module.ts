import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Module } from 'nestjs-s3';
import { AssetService } from './asset.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Asset } from './s3asset.entity';
import { SharedAsset } from './shared.asset.entity';

@Global()
@Module({
  imports: [
    S3Module.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        config: {
          endpoint: configService.get('S3_ENDPOINT'),
          accessKeyId: configService.get('S3_ACCESS_KEY_ID'),
          secretAccessKey: configService.get('S3_SECRET_ACCESS_KEY'),
          s3ForcePathStyle: true,
          // s3BucketEndpoint: true,
          signatureVersion: 'v4',
        },
      }),
    }),
    TypeOrmModule.forFeature([S3Asset, SharedAsset]),
  ],
  providers: [AssetService],
  exports: [AssetService],
})
export class SharedModule {}
