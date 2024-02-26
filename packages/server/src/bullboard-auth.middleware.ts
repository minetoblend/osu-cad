import { NestMiddleware } from '@nestjs/common';

export class BullboardAuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    const user = req.session.user;
    if (user && user.isAdmin) {
      next();
    } else {
      res.sendStatus(403);
    }
  }
}
