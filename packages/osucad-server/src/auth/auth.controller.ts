import { ConfigService } from '@nestjs/config';
import { ITokenInformation } from './interfaces';
import { HttpService } from '@nestjs/axios';
import { Controller, Get, Logger, Query, Redirect, Req } from '@nestjs/common';
import { Request } from 'express';
import { firstValueFrom, map } from 'rxjs';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  private readonly apiEndpoint = 'https://osu.ppy.sh/api/v2';
  private readonly logger = new Logger(AuthController.name);

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private readonly http: HttpService,
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    this.clientId = configService.getOrThrow('OSU_CLIENT_ID');
    this.clientSecret = configService.getOrThrow('OSU_CLIENT_SECRET');
    this.redirectUri = configService.getOrThrow('OSU_REDIRECT_URI');
  }

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
  @Redirect('http://10.25.120.192:5173/', 302)
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

      const user = await this.usersService.findOrCreateByProfile(profile);

      req.session.user = user;
    }

    this.logger.log(
      `User authenticated as ${req.session.user!.displayName} (${
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
}

declare module 'express-session' {
  interface SessionData {
    token?: ITokenInformation;
    user?: User;
  }
}
