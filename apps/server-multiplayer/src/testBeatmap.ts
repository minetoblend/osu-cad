import { BeatmapParser, rulesets, TimingControlPoint } from "@osucad/core";
import { EditorRuntime } from "@osucad/editor/runtime";
import type { IFullDocumentSummary } from "@osucad/multiplayer-protocol";
import { OsuRuleset } from "@osucad/ruleset-osu";
import { readdir, readFile } from "node:fs/promises";
import { cwd } from "node:process";
import type { BlobStorage } from "./services/blobs.js";
import { resolve } from "node:path";
import { CountingIdGenerator } from "@osucad/multiplayer-core";

export async function createTestBeatmapSummary(storage: BlobStorage): Promise<IFullDocumentSummary>
{
  rulesets.register(new OsuRuleset());

  const directory = resolve(cwd(), ".data/sample-beatmap");

  const files = await readdir(directory);

  const beatmapFile = files.find(it => it.endsWith(".osu"));
  if (!beatmapFile)
    throw new Error("No .osu file found in directory");

  const beatmap = await new BeatmapParser().parse(await readFile(resolve(directory, beatmapFile), "utf8"));


  const runtime = await EditorRuntime.createEmptyFromBeatmap(beatmap, {
    idGenerator: new CountingIdGenerator(),
    storage: {
      readBlob: id => storage.readBlob(id).then(data =>
      {
        if (data)
          return data.buffer;

        throw new Error("Not found");
      }),
      createBlob: blob => storage.writeBlob(new Uint8Array(blob))
        .then(id => ({ id })),
    },
  });

  const timingPoint = new TimingControlPoint();
  timingPoint.bpm = 180;
  runtime.root.controlPointInfo.add(timingPoint);

  for (const file of files)
  {
    if (file === beatmapFile)
      continue;

    const data = await readFile(resolve(directory, file));

    await runtime.root.fileSystem.write(file, data.buffer);
  }

  return {
    ...runtime.createSummary(),
    audience: {
      clients: [],
    },
    sequenceNumber: 0,
  };
}
