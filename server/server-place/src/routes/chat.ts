import type SSE from 'express-sse';
import type { Provider } from 'nconf';
import type { PlaceServerResources } from '../PlaceServerResources';
import { Router } from 'express';
import { z } from 'zod';
import { requiresAuth } from '../middleware/auth';
import { serializeUser } from './utils';

export function create(config: Provider, sse: SSE, resources: PlaceServerResources) {
  const router = Router();

  const chatMessage = z.object({
    content: z.string().trim().min(1).max(128),
    uid: z.string().uuid(),
  });

  router.post('/api/chat/message', requiresAuth, (req, res) => {
    const parsedBody = chatMessage.safeParse(req.body);
    if (!parsedBody.success) {
      res.sendStatus(400);
      return;
    }

    const { content, uid } = parsedBody.data;

    sse.send({
      content,
      uid,
      timestamp: Date.now(),
      user: serializeUser(req.user!),
    }, 'chat');

    res.sendStatus(201);
  });

  return router;
}
