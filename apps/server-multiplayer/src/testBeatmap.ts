import { BeatmapParser, rulesets, TimingControlPoint } from "@osucad/core";
import { EditorRuntime } from "@osucad/editor/runtime";
import type { IFullDocumentSummary } from "@osucad/multiplayer-protocol";
import { OsuRuleset } from "@osucad/ruleset-osu";
import { readFile } from "node:fs/promises";
import { cwd } from "node:process";

export async function createTestBeatmapSummary(): Promise<IFullDocumentSummary>
{
  rulesets.register(new OsuRuleset());

  console.log(cwd());

  const beatmap = await new BeatmapParser().parse(await readFile("./apps/server-multiplayer/test.osu", "utf8"));

  const runtime = await EditorRuntime.createEmptyFromBeatmap(beatmap);

  const timingPoint = new TimingControlPoint();
  timingPoint.bpm = 180;
  runtime.root.controlPointInfo.add(timingPoint);

  return {
    ...runtime.createSummary(),
    audience: {
      clients: [],
    },
    sequenceNumber: 0,
  };
}
