import type { RequestHandler } from 'express';

declare module 'express-session' {
  interface SessionData {
    passport: {
      user: {
        id: number;
        username: string;
        avatar_url: string;
      };
    };
  }
}

export const requiresAuth: RequestHandler = (req, res, next) => {
  if (!req.session.passport?.user) {
    res.sendStatus(401);
    return;
  }

  req.user = req.session.passport.user;

  next();
};
