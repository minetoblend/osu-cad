import express from "express";
import { run } from "node:test";
import { Room } from "./room.js";
import { EditorRuntime } from "@osucad/editor";
import { OsuRuleset } from "@osucad/ruleset-osu";

void main();

async function main()
{
  const host = process.env.HOST ?? "localhost";
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  const app = express();

  const room = await Room.create();

  app.get("/", (req, res) => res.json(room.runtime.createSummary()));

  app.listen(port, host, () =>
  {
    console.log(`[ ready ] http://${host}:${port}`);
  });

}
