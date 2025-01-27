import { requiresAuth } from '../middleware/requiresAuth';
import { createRouter } from '../utils/router';

export function userRoutes() {
  return createRouter((router) => {
    router.get('/me', requiresAuth, (req, res) => {
      const { id, username, avatar_url } = req.user as any;

      res.json({ id, username, avatar_url });
    });

    router.checkout;
  });
}
