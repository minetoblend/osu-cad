import { Controller, Get, Logger, Query, Redirect, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { ITokenInformation } from './interfaces';
import { UserEntity } from '../users/user.entity';
import { Request } from 'express';
import { UserService } from '../users/user.service';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';

@Controller('/auth')
export class AuthController {
  private readonly apiEndpoint = 'https://osu.ppy.sh/api/v2';
  private readonly logger = new Logger(AuthController.name);

  private readonly clientId = this.configService.getOrThrow<string>(
    'OSU_OAUTH_CLIENT_ID',
  );
  private readonly clientSecret = this.configService.getOrThrow<string>(
    'OSU_OAUTH_CLIENT_SECRET',
  );
  private readonly redirectUri = this.configService.getOrThrow<string>(
    'OSU_OAUTH_REDIRECT_URI',
  );

  constructor(
    private readonly http: HttpService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  @Get('/login')
  @Redirect('https://osu.ppy.sh/', 302)
  async authenticate(
    @Req() req: Request,
    @Query('redirect') redirect: string | null,
  ) {
    this.logger.log('User requested authentication');
    const url = new URL('https://osu.ppy.sh/oauth/authorize');

    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', this.redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', 'public identify');

    if (redirect) {
      url.searchParams.append('state', JSON.stringify({ redirect }));
    }

    return { url: url.href };
  }

  @Get('/callback')
  @Redirect('/', 302)
  async callback(
    @Query('code') code: string,
    @Query('state') state: string | null,
    @Req() req: Request,
  ) {
    if (!req.session.user) {
      const response = await firstValueFrom(
        this.http.post('https://osu.ppy.sh/oauth/token', {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }),
      );

      const token = response.data as ITokenInformation;
      req.session.token = token;

      const profile = await this.getProfileData(token);

      const user = await this.userService.findOrCreateByProfile(profile);

      await this.auditService.record(user, 'login', {});

      req.session.user = user;
    }

    this.logger.log(
      `User authenticated as ${req.session.user!.username} (${
        req.session.user!.id
      })`,
    );

    if (state) {
      const stateData = JSON.parse(state);

      if (stateData.redirect) {
        return { url: stateData.redirect };
      }
    }
  }

  private getProfileData(token: ITokenInformation) {
    return firstValueFrom(
      this.http
        .get(`${this.apiEndpoint}/me`, {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        })
        .pipe(map((response) => response.data)),
    );
  }

  @Get('/logout')
  @Redirect('/', 302)
  async logout(@Req() req: Request) {
    this.logger.log(
      `User ${req.session.user?.username} (${req.session.user?.id}) logged out`,
    );

    if (req.session.user) {
      await this.auditService.record(req.session.user, 'logout', {});
    }

    req.session.destroy(() => {});
  }
}

declare module 'express-session' {
  interface SessionData {
    token?: ITokenInformation;
    user?: UserEntity;
  }
}
