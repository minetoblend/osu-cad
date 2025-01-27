import passport from 'passport';
import { osuOauth } from '../passport';
import { createRouter } from '../utils/router';

export function authRoutes() {
  return createRouter((router) => {
    router.get('/osu/login', passport.authenticate(osuOauth));

    router.get('/osu/callback', passport.authenticate(osuOauth, { failureRedirect: '/' }), (req, res) => {
      res.send('Hello, world!');
    });
  });
}
