import {Injectable, NestMiddleware} from "@nestjs/common";
import {Request} from "express";
import * as fs from "fs/promises";

@Injectable()
export class FrontendMiddleware implements NestMiddleware {
  async use(req: Request, res: any, next: (error?: any) => void): Promise<void> {
    const user = req.session.user;

    const index = await fs.readFile("../client/dist/index.html", "utf-8");

    const rendered = index.replace(`<!-- USER_DATA -->`, `<script id="user-data" type="application/json">${JSON.stringify(user)}</script>`);

    res.send(rendered);

  }

}