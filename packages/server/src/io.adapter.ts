import { IoAdapter } from "@nestjs/platform-socket.io";
import { NestExpressApplication } from "@nestjs/platform-express";
import { RequestHandler } from "express";

export class SessionIoAdapter extends IoAdapter {
  constructor(
    app: NestExpressApplication,
    public session: RequestHandler,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.engine.use(this.session);
    return server;
  }
}
