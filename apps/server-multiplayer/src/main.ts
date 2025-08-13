import express from "express";
import http from "node:http";
import cors from "cors";
import { Server } from "socket.io";
import { acceptConnections } from "./room.js";

void main();

async function main()
{
  const host = process.env.HOST ?? "localhost";
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  const app = express();
  app.use(cors());

  const server = http.createServer(app);
  const io = new Server(server);

  await acceptConnections(io);

  server.listen(port, host, () =>
  {
    console.log(`[ ready ] http://${host}:${port}`);
  });

}
