import type { Provider } from 'nconf';
import { Router } from 'express';
import passport from 'passport';
import { osuOauth } from '../passport';

export function create(config: Provider) {
  const router = Router();

  router.get('/api/auth/osu/login', passport.authenticate(osuOauth));
  router.get('/api/auth/osu/callback', passport.authenticate(osuOauth, { failureRedirect: '/' }), (req, res) => {
    res.redirect('/');
  });

  return router;
}
