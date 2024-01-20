import {Injectable, NestMiddleware} from "@nestjs/common";
import {Request} from "express";


@Injectable()
export class FrontendMiddleware implements NestMiddleware {
  use(req: Request, res: any, next: (error?: any) => void): any {
    const user = req.session.user;



    res.render("index-dev", {
      user: user ? { id: user.id, username: user.username, avatarUrl: user.avatarUrl } : null,
    });
  }

}