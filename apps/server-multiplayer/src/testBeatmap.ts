import { TimingControlPoint } from "@osucad/core";
import { EditorRuntime } from "@osucad/editor/runtime";
import type { IFullDocumentSummary } from "@osucad/multiplayer-protocol";
import { OsuRuleset } from "@osucad/ruleset-osu";

export async function createTestBeatmapSummary(): Promise<IFullDocumentSummary>
{
  const runtime = await EditorRuntime.createEmpty(new OsuRuleset());

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
