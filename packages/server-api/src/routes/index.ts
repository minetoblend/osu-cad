import { Router } from 'express';
import { authRoutes } from './auth';
import { roomRoutes } from './rooms';
import { userRoutes } from './users';

export function createApi() {
  const router = Router();

  router.use('/auth', authRoutes());
  router.use('/users', userRoutes());
  router.use('/rooms', roomRoutes());

  return router;
}
