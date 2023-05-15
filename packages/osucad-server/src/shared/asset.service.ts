import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { InjectS3 } from 'nestjs-s3';
import { S3Asset } from './s3asset.entity';
import { Repository } from 'typeorm';
import { SharedAsset, SharedAssetType } from './shared.asset.entity';
import * as crypto from 'crypto';

interface CreateAssetOptions {
  data: Buffer;
  fileName: string;
  bucket: string;
  type: SharedAssetType;
  contentType: string;
}

@Injectable()
export class AssetService {
  constructor(
    @InjectS3()
    private readonly s3: S3,
    @InjectRepository(S3Asset)
    private readonly s3assetRepository: Repository<S3Asset>,
    @InjectRepository(SharedAsset)
    private readonly assetRepository: Repository<SharedAsset>,
  ) {}

  async createAsset(options: CreateAssetOptions): Promise<SharedAsset> {
    const { bucket, data, fileName, type, contentType } = options;

    const hash = crypto.createHash('sha1');
    hash.setEncoding('hex');
    hash.write(data);
    hash.end();

    const hashDigest = hash.read();

    let s3Asset = await this.s3assetRepository.findOne({
      where: { bucket, key: hashDigest },
    });

    if (!s3Asset) {
      s3Asset = new S3Asset();
      s3Asset.bucket = bucket;
      s3Asset.key = hashDigest;

      await this.s3
        .putObject({
          Bucket: bucket,
          Key: hashDigest,
          Body: data,
          ContentType: contentType,
        })
        .promise();

      await this.s3assetRepository.save(s3Asset);
    }

    const asset = new SharedAsset();
    asset.s3Asset = s3Asset;
    asset.fileName = fileName;
    asset.fileSize = data.length;
    asset.type = type;
    asset.contentType = contentType;

    return this.assetRepository.save(asset);
  }

  async getAsset(id: string): Promise<SharedAsset | null> {
    return this.assetRepository.findOneBy({ id });
  }

  async getAssetUrl(asset: SharedAsset): Promise<string> {
    const url = await this.s3.getSignedUrlPromise('getObject', {
      Bucket: asset.s3Asset.bucket,
      Key: asset.s3Asset.key,
    });
    return url;
  }

  async deleteAsset(asset: SharedAsset) {
    const { s3Asset } = asset;

    await this.assetRepository.delete(asset);

    const refCount = await this.assetRepository.count({
      where: { s3Asset },
    });

    if (refCount === 0) {
      await this.s3
        .deleteObject({
          Bucket: s3Asset.bucket,
          Key: s3Asset.key,
        })
        .promise();
      await this.s3assetRepository.delete(s3Asset);
      return true;
    }
    return false;
  }
}
