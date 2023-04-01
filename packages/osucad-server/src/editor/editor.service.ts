import { Injectable } from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';

@Injectable()
export class EditorService {
  constructor(
    @InjectS3()
    private readonly s3: S3,
  ) {}

  getBackground(beatmapId: string) {
    return this.s3.getSignedUrl('getObject', {
      Bucket: 'assets',
      Key: `${beatmapId}/background`,
      Expires: 60 * 60 * 24,
    });
  }
}
