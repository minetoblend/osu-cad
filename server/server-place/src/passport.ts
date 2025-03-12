import type { Provider } from 'nconf';
import type { PassportStatic } from 'passport';
import type { VerifyCallback } from 'passport-oauth2';
import type { UserService } from './services/UserService';
import passport from 'passport';
import Oauth2Strategy from 'passport-oauth2';

export const osuOauth = 'osu-oauth2';

declare global {
  type UserEntity = import('./entities/User').User;

  // eslint-disable-next-line ts/no-namespace
  namespace Express {
    interface User extends UserEntity {}
  }
}

export function setupPassport(config: Provider, userService: UserService): PassportStatic {
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    const user = await userService.findById(id as number);

    done(null, user ?? null);
  });

  passport.use(osuOauth, new Oauth2Strategy({
    authorizationURL: 'https://osu.ppy.sh/oauth/authorize',
    tokenURL: 'https://osu.ppy.sh/oauth/token',
    clientID: config.get('oauth:clientId'),
    clientSecret: config.get('oauth:clientSecret'),
    callbackURL: config.get('oauth:callbackUrl'),
    scope: ['public', 'identify'],
    skipUserProfile: true,
  }, async (accessToken: string, refreshToken: string, profile: any, cb: VerifyCallback) => {
    try {
      const { id, username, avatar_url } = await fetch ('https://osu.ppy.sh/api/v2/me', {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then(res => res.json());

      const user = await userService.upsertUser(id, username);

      cb(null, user);
    }
    catch (err) {
      cb(err);
    }
  }));

  return passport;
}
