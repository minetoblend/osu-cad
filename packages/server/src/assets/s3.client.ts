import { S3Client } from '@aws-sdk/client-s3';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const s3ClientProvider: Provider = {
  provide: S3Client,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    return new S3Client({
      endpoint: configService.getOrThrow('S3_ENDPOINT_URL'),
      region: configService.getOrThrow('S3_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow('S3_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow('S3_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
  },
};
