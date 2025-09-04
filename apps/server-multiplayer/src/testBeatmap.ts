import { TimingControlPoint } from "@osucad/core";
import { EditorRuntime } from "@osucad/editor/runtime";
import { OsuRuleset } from "@osucad/ruleset-osu";

export async function createTestBeatmapSummary()
{
  const runtime = await EditorRuntime.createEmpty(new OsuRuleset());

  const timingPoint = new TimingControlPoint();
  timingPoint.bpm = 180;
  runtime.root.controlPointInfo.add(timingPoint);

  return runtime.createSummary();
}
