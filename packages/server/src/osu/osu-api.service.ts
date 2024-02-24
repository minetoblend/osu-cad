import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { OsuUser } from '@osucad/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OsuUserEntity } from './osu-user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OsuApiService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(OsuUserEntity)
    private readonly osuUserRepository: Repository<OsuUserEntity>,
  ) {}

  private knownUsers = new Set<number>();

  get clientId(): string {
    return this.configService.getOrThrow<string>('OSU_OAUTH_CLIENT_ID');
  }

  get clientSecret(): string {
    return this.configService.getOrThrow<string>('OSU_OAUTH_CLIENT_SECRET');
  }

  async lookupUser(username: string) {
    const token = await this.getToken();
    const response = await axios.get<{
      user: {
        total: number;
        data: OsuUser[];
      };
    }>('https://osu.ppy.sh/api/v2/search', {
      params: {
        mode: 'user',
        query: username,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const users = response.data.user.data;

    for (const user of users) {
      if (this.knownUsers.has(user.id)) {
        continue;
      }

      this.osuUserRepository.upsert(
        {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatar_url,
        },
        ['id'],
      );
    }

    return users;
  }

  private currentToken: string | null = null;

  private async getToken() {
    if (!this.currentToken) {
      const newToken = await this.getNewToken();
      this.currentToken = newToken.access_token;
      setTimeout(
        () => {
          this.currentToken = null;
        },
        (newToken.expires_in * 1000) / 2,
      );
    }

    return this.currentToken;
  }

  private async getNewToken() {
    const response = await axios.post<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>('https://osu.ppy.sh/oauth/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
      scope: 'public',
    });

    return response.data;
  }
}
