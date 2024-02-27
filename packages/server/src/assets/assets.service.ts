import { Inject, Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
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
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class AssetsService {
  constructor(
    private readonly s3: S3Client,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @InjectRepository(S3AssetEntity)
    private readonly s3AssetRepository: Repository<S3AssetEntity>,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private creatingAssetMap = new Map<string, Promise<S3AssetEntity>>();

  async addAssetToMapset(
    options: AddAssetToMapsetOptions,
  ): Promise<AssetEntity> {
    const { buffer, path, mapset } = options;

    const existingAsset = await this.getAsset(mapset, path);

    const s3Asset = await this.getAndIncreaseRefcount(
      buffer,
      existingAsset?.asset,
    );

    if (existingAsset) {
      existingAsset.asset = s3Asset;
      await this.assetRepository.save(existingAsset);

      return existingAsset;
    }

    const asset = new AssetEntity();
    asset.path = path;
    asset.mapset = mapset;
    asset.asset = s3Asset;
    await this.assetRepository.save(asset);

    return asset;
  }

  async getAsset(
    mapset: MapsetEntity,
    path: string,
  ): Promise<AssetEntity | null> {
    return this.assetRepository.findOne({
      where: {
        mapset: {
          id: mapset.id,
        },
        path,
      },
      relations: ['asset'],
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

  async getS3AssetUrl(
    s3Asset: S3AssetEntity,
    options: {
      contentType?: string;
    } = {},
  ): Promise<string> {
    const cached = await this.cacheManager.get('s3:asset:' + s3Asset.key);
    if (cached && typeof cached === 'string') {
      return cached;
    }

    const command = new GetObjectCommand({
      Bucket: s3Asset.bucket,
      Key: s3Asset.key,
      ResponseContentType: options.contentType,
    });

    let signingDate = Date.now();

    const expireDuration = 24 * 60 * 60;
    signingDate = signingDate - (signingDate % ((expireDuration / 2) * 1000));

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: expireDuration,
      signingDate: new Date(signingDate),
    });

    await this.cacheManager.set(
      's3:asset:' + s3Asset.key,
      url,
      expireDuration / 2,
    );

    return url;
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

  async getAssetContent(asset: AssetEntity): Promise<Buffer | null> {
    const command = new GetObjectCommand({
      Bucket: asset.asset.bucket,
      Key: asset.asset.key,
    });

    const response = await this.s3.send(command);

    const bytes = await response.Body?.transformToByteArray();

    if (!bytes) {
      return null;
    }

    return Buffer.from(bytes);
  }

  async getAndIncreaseRefcount(buffer: Buffer, previous?: S3AssetEntity) {
    return await this.assetRepository.manager.transaction(
      async (entityManager) => {
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');

        if (hash === previous?.key) {
          return previous;
        } else if (previous) {
          await entityManager.update(
            S3AssetEntity,
            { key: previous.key },
            { refCount: () => 'refCount - 1' },
          );
        }

        const asset = await this.s3AssetRepository.findOneBy({ key: hash });

        if (asset) {
          await entityManager.update(
            S3AssetEntity,
            { key: asset.key },
            { refCount: () => 'refCount + 1' },
          );
          return asset;
        }

        const s3Asset = new S3AssetEntity();
        s3Asset.key = hash;
        s3Asset.filesize = buffer.length;
        s3Asset.bucket = this.configService.get(
          'S3_BUCKET_NAME',
          'osucad-assets',
        );
        s3Asset.refCount = 1;

        const command = new PutObjectCommand({
          Bucket: s3Asset.bucket,
          Key: s3Asset.key,
          Body: buffer,
        });

        await this.s3.send(command);

        await entityManager.save(s3Asset);

        return s3Asset;
      },
    );
  }

  async returnAsset(asset: AssetEntity) {
    return await this.assetRepository.manager.transaction(
      async (entityManager) => {
        await entityManager.update(
          S3AssetEntity,
          { key: asset.asset.key },
          { refCount: () => 'refCount - 1' },
        );
      },
    );
  }

  async increaseRefCount(asset: S3AssetEntity, count: number = 1) {
    await this.s3AssetRepository.update(
      { key: asset.key },
      { refCount: () => 'refCount + ' + count },
    );

    return asset;
  }

  async getS3Asset(key: string): Promise<S3AssetEntity | null> {
    return this.s3AssetRepository.findOneBy({ key });
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
