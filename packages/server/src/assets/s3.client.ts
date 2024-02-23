import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const s3ClientProvider: Provider = {
  provide: S3Client,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const client = new S3Client({
      endpoint: configService.get('S3_ENDPOINT_URL'),
      region: configService.get('S3_REGION'),
      credentials: {
        accessKeyId: configService.get('S3_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('S3_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });

    // Test the connection
    await client.send(new ListBucketsCommand({}));

    return client;
  },
};
