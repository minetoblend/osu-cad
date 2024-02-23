import { Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { MapsetEntity } from '../beatmap/mapset.entity';
import * as crypto from 'crypto';
import { AssetEntity } from './asset.entity';
import { S3AssetEntity } from './s3-asset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AssetsService {
  constructor(
    private readonly s3: S3Client,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @InjectRepository(S3AssetEntity)
    private readonly s3AssetRepository: Repository<S3AssetEntity>,
    private readonly configService: ConfigService,
  ) {}

  private creatingAssetMap = new Map<string, Promise<S3AssetEntity>>();

  async addAssetToMapset(
    options: AddAssetToMapsetOptions,
  ): Promise<AssetEntity> {
    return this.assetRepository.manager.transaction(async (entityManager) => {
      const { buffer, path, mapset } = options;

      const hash = crypto.createHash('sha256').update(buffer).digest('hex');

      const s3Asset = await this.getOrCreateS3Asset(
        entityManager,
        hash,
        buffer,
      );

      await entityManager.update(
        S3AssetEntity,
        { key: s3Asset.key },
        { refCount: () => 'refCount + 1' },
      );

      const asset = new AssetEntity();
      asset.path = path;
      asset.mapset = mapset;
      asset.asset = s3Asset;

      await entityManager.save(asset);

      return asset;
    });
  }

  async getAssetUrl(
    mapset: MapsetEntity,
    path: string,
  ): Promise<string | null> {
    const asset = await this.assetRepository.findOne({
      where: {
        mapset: {
          id: mapset.id,
        },
        path,
      },
      relations: ['asset'],
    });

    if (!asset) {
      return null;
    }

    const command = new GetObjectCommand({
      Bucket: asset.asset.bucket,
      Key: asset.asset.key,
    });

    let signingDate = Date.now();

    const expireDuration = 24 * 60 * 60;

    signingDate = signingDate - (signingDate % ((expireDuration / 2) * 1000));

    return await getSignedUrl(this.s3, command, {
      expiresIn: expireDuration,
      signingDate: new Date(signingDate),
    });
  }

  private async getOrCreateS3Asset(
    entityManager: EntityManager,
    key: string,
    buffer: Buffer,
  ): Promise<S3AssetEntity> {
    const asset = await this.getS3AssetByKey(entityManager, key);
    if (asset) {
      return asset;
    }

    const currentlyCreating = this.creatingAssetMap.get(key);
    if (currentlyCreating) {
      return currentlyCreating;
    }

    const promise = this.createS3Asset(entityManager, key, buffer);
    this.creatingAssetMap.set(key, promise);
    const result = await promise;
    this.creatingAssetMap.delete(key);
    return result;
  }

  private async getS3AssetByKey(
    entityManager: EntityManager,
    key: string,
  ): Promise<S3AssetEntity | null> {
    const asset = await this.s3AssetRepository.findOneBy({ key });
    if (!asset) {
      return null;
    }
    return asset;
  }

  private async createS3Asset(
    entityManager: EntityManager,
    key: string,
    buffer: Buffer,
  ): Promise<S3AssetEntity> {
    const asset = new S3AssetEntity();
    asset.key = key;
    asset.filesize = buffer.length;
    asset.bucket = this.configService.get('S3_BUCKET_NAME', 'osucad-assets');

    const headCommand = new HeadObjectCommand({
      Bucket: asset.bucket,
      Key: asset.key,
    });

    let objectExists = false;
    try {
      await this.s3.send(headCommand);

      objectExists = true;
    } catch (e) {
      if (e.name !== 'NotFound') {
        throw e;
      }
    }

    if (!objectExists) {
      const command = new PutObjectCommand({
        Bucket: asset.bucket,
        Key: asset.key,
        Body: buffer,
      });

      await this.s3.send(command);
    }

    await entityManager.save(asset);

    return asset;
  }
}

export interface AddAssetToMapsetOptions {
  buffer: Buffer;
  path: string;
  mapset: MapsetEntity;
}

export interface CreateS3AssetOptions {
  buffer: Buffer;
  path: string;
  mapset: MapsetEntity;
}
