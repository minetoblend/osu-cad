import { Router } from 'express';

export function createRouter(setup: (router: Router) => void) {
  const router = Router();

  setup(router);

  return router;
}
