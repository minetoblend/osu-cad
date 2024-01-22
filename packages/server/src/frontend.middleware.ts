import {Injectable, NestMiddleware} from "@nestjs/common";
import {Request} from "express";
import * as fs from "fs/promises";

@Injectable()
export class FrontendMiddleware implements NestMiddleware {
  async use(req: Request, res: any, next: (error?: any) => void): Promise<void> {
    const user = req.session.user;

    if (process.env.NODE_ENV === "production") {
      const index = await fs.readFile("../client/dist/index.html", "utf-8");
      const rendered = index.replace(`<!-- USER_DATA -->`, `<script id="user-data" type="application/json">${JSON.stringify(user ?? null)}</script>`);
      res.send(rendered);
    } else {
      res.render("index-dev", {
        user: user ? { id: user.id, username: user.username, avatarUrl: user.avatarUrl } : null,
      });
    }

  }

}