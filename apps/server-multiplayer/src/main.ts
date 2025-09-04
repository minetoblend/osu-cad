import express from "express";
import http from "node:http";
import cors from "cors";
import type { Socket } from "socket.io";
import { Server } from "socket.io";
import { Room } from "./room.js";
import type { ClientMessages, ServerMessages } from "@osucad/multiplayer-core";
import { LocalDeltaStore } from "./services/deltas.js";
import { LocalDocumentStorage } from "./services/storage.js";
import { createTestBeatmapSummary } from "./testBeatmap.js";

void main();

async function main()
{
  const host = process.env.HOST ?? "localhost";
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server);

  const deltaStore = new LocalDeltaStore();
  const documentStorage = new LocalDocumentStorage();

  await documentStorage.writeSummary("beatmap", await createTestBeatmapSummary(), 0);

  const rooms: Record<string, Room> = {
    beatmap: await Room.create("beatmap", io, deltaStore),
  };

  io.on("connect", (socket: Socket<ClientMessages, ServerMessages>) =>
  {
    socket.on("connectDocument", async (message, callback) =>
    {
      const room = rooms[message.documentId];

      callback(await room.accept(socket));
    });
  });

  app.get("/api/summary/:id", async (req, res) =>
  {
    const summary = await documentStorage.readSummary(req.params.id);

    if (!summary)
    {
      res.sendStatus(404);
      return;
    }

    res.json(summary);
  });

  app.post("/api/summary/:id", async (req, res) =>
  {
    const { summary, sequenceNumber } = req.body;

    const version = await documentStorage.writeSummary(req.params.id, summary, sequenceNumber);

    res.json(version);
  });

  app.get("/api/deltas/:id", async (req, res) =>
  {
    const deltas = await deltaStore.getDeltas(req.params.id, {
      start: typeof req.query.start === "string" ? Number.parseInt(req.query.start) : undefined,
      end: typeof req.query.end === "string" ? Number.parseInt(req.query.end) : undefined,
    });

    res.json(deltas);
  });

  server.listen(port, host, () =>
  {
    console.log(`[ ready ] http://${host}:${port}`);
  });
}
