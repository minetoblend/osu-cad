import passport from 'passport';
import { osuOauth } from '../passport';
import { createRouter } from '../utils/router';

export function authRoutes() {
  return createRouter((router) => {
    router.get('/osu/login', passport.authenticate(osuOauth));

    router.get('/osu/callback', passport.authenticate(osuOauth, { failureRedirect: '/' }), (req, res) => {
      if (req.headers.referer)
        res.redirect(`${req.headers.referer}login-callback`);
      else
        res.redirect('/');
    });

    router.get('/logout', (req, res) => {
      req.session.destroy(() => {
        res.sendStatus(200);
      });
    });
  });
}
