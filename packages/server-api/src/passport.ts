import type { VerifyCallback } from 'passport-oauth2';
import config from 'config';
import passport from 'passport';

import Oauth2Strategy from 'passport-oauth2';

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user as any));

export const osuOauth = 'osu-oauth2';

passport.use(osuOauth, new Oauth2Strategy({
  authorizationURL: 'https://osu.ppy.sh/oauth/authorize',
  tokenURL: 'https://osu.ppy.sh/oauth/token',
  clientID: config.get<string>('oauth.clients.osu.clientId'),
  clientSecret: config.get<string>('oauth.clients.osu.clientSecret'),
  callbackURL: config.get<string>('oauth.clients.osu.callbackUrl'),
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

    cb(null, { id, username, avatar_url });
  }
  catch (err) {
    cb(err);
  }
}));

export function createPassport() {
  return passport.initialize();
}
