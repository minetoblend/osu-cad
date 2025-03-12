import type { RequestHandler } from 'express';
import type { User } from '../entities/User';

declare module 'express-session' {
  interface SessionData {
    passport: {
      user: User;
    };
  }
}

export const requiresAuth: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  next();
};
