import express from "express";
import http from "node:http";
import cors from "cors";
import type { Socket } from "socket.io";
import { Server } from "socket.io";
import type { ClientMessages, ServerMessages } from "@osucad/multiplayer-core";
import { LocalDeltaStore } from "./services/deltas.js";
import { LocalDocumentStorage } from "./services/storage.js";
import { createTestBeatmapSummary } from "./testBeatmap.js";
import { MessageProcessorFactory } from "./MessageProcessorFactory.js";
import { PartitionManager } from "@osucad/multiplayer-server";
import { connectDocument } from "./connectDocument.js";

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

  const processorFactory = new MessageProcessorFactory(io, deltaStore);

  const partitionManager = new PartitionManager(processorFactory);

  await documentStorage.writeSummary("beatmap", await createTestBeatmapSummary());

  io.on("connect", (socket: Socket<ClientMessages, ServerMessages>) =>
  {
    socket.on("connectDocument", async (message, callback) =>
    {
      const response = await connectDocument(socket, partitionManager, message);

      callback(response);
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
    const { summary } = req.body;

    const version = await documentStorage.writeSummary(req.params.id, summary);

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
