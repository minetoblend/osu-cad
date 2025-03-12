import type { Provider } from 'nconf';
import type { PlaceServerResources } from '../PlaceServerResources';
import { Router } from 'express';
import { requiresAuth } from '../middleware/auth';

export function create(config: Provider, { userService }: PlaceServerResources) {
  const router = Router();

  router.get('/api/users/me', requiresAuth, async (req, res) => {
    const { username, id, lastObjectPlaced } = req.user!;

    res.json({ username, id, lastObjectPlaced });
  });

  router.get('/api/users/:id/avatar', async (req, res) => {
    const imageResponse = await fetch(`https://a.ppy.sh/${req.params.id}`, {

    });

    if (!imageResponse.ok) {
      res.sendStatus(404);
      return;
    }

    const data = await imageResponse.arrayBuffer();

    res
      .type(imageResponse.headers.get('content-type')!)
      .send(Buffer.from(new Uint8Array(data)));
  });

  return router;
}
