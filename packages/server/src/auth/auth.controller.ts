import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  Redirect,
  Req,
  Res,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { ITokenInformation } from './interfaces';
import { UserEntity } from '../users/user.entity';
import { Request, Response } from 'express';
import { UserService } from '../users/user.service';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';
import { ClientTokenService } from './client-token.service';

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
    private readonly clientTokenService: ClientTokenService,
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
  async callback(
    @Query('code') code: string,
    @Query('state') state: string | null,
    @Req() req: Request,
    @Res() res: Response,
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

      const allowedUsers = [
        6411631, // maarvin
        7704651, // visionary
        9331411, // arkisol
        7782553, // aesth
        6573093, // olibomby
        7279762, // coppertine
        3827077, // nhlx
        2688103, // ioexception
        7320249, // fogsaturate
      ];

      if (!allowedUsers.includes(user.id)) {
        res.status(401).send('You are not allowed to access this site.');
        return;
      }

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
        res.redirect(stateData.redirect);
        return;
      }
    }

    res.redirect('/');
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

  // special login route for archie because he was a dumbass and permanently deleted his osu account
  @Get('/archie/:token')
  @Redirect('/', 302)
  async archieLogin(@Req() req: Request, @Param('token') token: string) {
    if (token === this.configService.getOrThrow('ARCHIE_LOGIN_TOKEN')) {
      const user = await this.userService.findOrCreateByProfile({
        id: 23429623,
        username: 'mrcheesemr',
        avatar_url:
          'https://imagedelivery.net/4tTpIzPvdP4mJdshA1MmJw/a0fb6f3f-a15d-4edb-98c3-70b721839600/thumbnail',
      });

      await this.auditService.record(user, 'login', {});

      req.session.user = user;
    }
  }

  @Get('/client')
  async clientLogin(@Req() req: Request, @Res() res: Response) {
    if (!req.session.user) {
      res.redirect(
        `/auth/login?redirect=${encodeURIComponent('/auth/client')}`,
      );

      return;
    }

    const token = await this.clientTokenService.createToken(req.session.user);

    res.contentType('text/html').send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>osucad</title>
  </head>
  <body>
    <h1>Successfully logged in, you can close this page now</h1>
    <script>
      window.open('osucad://login/callback?token=${token}');
    </script>
  </body>
</html>

      `);
  }

  @Get('/client/callback')
  async clientCallback(@Req() req: Request, @Res() res: Response) {
    const token = req.query.token as string;

    const user = await this.clientTokenService.validateToken(token);

    if (!user) {
      res.status(404).send('Token not found');
      return;
    }

    res.sendStatus(200);
  }
}

declare module 'express-session' {
  interface SessionData {
    token?: ITokenInformation;
    user?: UserEntity;
  }
}
