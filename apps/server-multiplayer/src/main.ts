import express from "express";
import http from "node:http";
import cors from "cors";
import type { Socket } from "socket.io";
import { Server } from "socket.io";
import { Room } from "./room.js";
import type { ClientMessages, ServerMessages } from "@osucad/multiplayer-core";

void main();

async function main()
{
  const host = process.env.HOST ?? "localhost";
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  const app = express();
  app.use(cors());

  const server = http.createServer(app);
  const io = new Server(server);

  const rooms: Record<string, Room> = {
    beatmap: await Room.create("beatmap", io),
  };

  io.on("connect", (socket: Socket<ClientMessages, ServerMessages>) =>
  {
    socket.on("connectDocument", async (message, callback) =>
    {
      const room = rooms[message.documentId];

      callback(await room.accept(socket));
    });
  });

  app.get("/api/summary/:id", (req, res) =>
  {
    const room = rooms[req.params.id];
    if (!room)
    {
      res.sendStatus(404);
      return;
    }

    res.json({
      sequenceNumber: room.sequenceNumber,
      summary: room.runtime.createSummary(),
    });
  });

  app.get("/api/deltas/:id", (req, res) =>
  {
    const room = rooms[req.params.id];
    if (!room)
    {
      res.sendStatus(404);
      return;
    }

    if (typeof req.query.since !== "string")
    {
      res.sendStatus(400);
      return;
    }


    const since = Number.parseInt(req.query.since);

    if (!Number.isFinite(since))
    {
      res.sendStatus(400);
      return;
    }

    const deltas = room.deltas.filter(it => it.sequenceNumber >= since);

    res.json(deltas);
  });

  server.listen(port, host, () =>
  {
    console.log(`[ ready ] http://${host}:${port}`);
  });
}
