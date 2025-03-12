import type { Provider } from 'nconf';
import type { User } from '../entities/User';
import type { PlaceServerResources } from '../PlaceServerResources';
import { Router } from 'express';
import SSE from 'express-sse';
import { requiresAuth } from '../middleware/auth';

export function create(config: Provider, { beatmapService, userService }: PlaceServerResources) {
  const router = Router();

  const sse = new SSE();

  const placementCooldown = config.get('placementCooldown') * 1000;

  function getTimeRemaining(user: User) {
    return {
      timeRemaining: userService.getCooldown(user),
      totalCountdown: placementCooldown,
    };
  }

  router.get('/api/place/countdown', requiresAuth, async (req, res) => {
    res.json(getTimeRemaining(req.user!));
  });

  // TODO: remove this
  router.get('/api/place/countdown/reset', requiresAuth, async (req, res) => {
    const user = await userService.resetCooldown(req.user!);

    sse.send({ user: user.id }, 'place');

    res.json(getTimeRemaining(user));
  });

  router.use('/api/place/events', sse.init);

  return router;
}
