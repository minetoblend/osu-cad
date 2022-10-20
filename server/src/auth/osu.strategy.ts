import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import Strategy from 'passport-osu';
import {AuthService} from './auth.service';

@Injectable()
export class OsuStrategy extends PassportStrategy(Strategy, 'osu') {
  constructor(private readonly authService: AuthService) {
    super({
      type: 'StrategyOptions',
      clientID: process.env.OSU_CLIENT_ID,
      clientSecret: process.env.OSU_CLIENT_SECRET,
      callbackURL: process.env.OSU_OAUTH_CALLBACK,
      scope: process.env.OSU_SCOPES.split(','),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const user = await this.authService.validateUser(
      accessToken,
      refreshToken,
      profile,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}