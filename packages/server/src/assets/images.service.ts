import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImagesService {
  constructor(private readonly configService: ConfigService) {}

  async uploadImage(
    id: string,
    filename: string,
    buffer: Buffer,
    metadata: Record<string, string>,
    update = false,
  ) {
    id = `${this.configService.getOrThrow('CLOUDFLARE_PATH_PREFIX')}/${id}`;

    const body = new FormData();
    body.append('id', id);
    body.append('file', new Blob([buffer]), filename);
    body.append('metadata', JSON.stringify(metadata));

    let url = `https://api.cloudflare.com/client/v4/accounts/${this.configService.getOrThrow('CLOUDFLARE_ACCOUNT_ID')}/images/v1`;

    if (update) {
      url += `/${id}`;
    }

    const response = await fetch(url, {
      method: update ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${this.configService.getOrThrow('CLOUDFLARE_API_TOKEN')}`,
      },
      body,
    });

    return (await response.json()) as {
      result: {
        id: string;
      };
      success: boolean;
    };
  }

  getImageUrl(id: string, variant: string): string;
  getImageUrl(
    id: string | null | undefined,
    variant: string,
  ): string | undefined;
  getImageUrl(
    id: string | null | undefined,
    variant: string,
  ): string | undefined {
    if (!id) {
      return undefined;
    }

    const accountHash = this.configService.getOrThrow(
      'CLOUDFLARE_ACCOUNT_HASH',
    );

    return `https://imagedelivery.net/${accountHash}/${id}/${variant}`;
  }
}
