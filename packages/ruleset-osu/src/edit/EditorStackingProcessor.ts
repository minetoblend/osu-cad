import type { EditorBeatmap } from "@osucad/editor";
import { EditorBeatmapProcessor } from "@osucad/editor";
import type { OsuHitObject } from "../hitObjects";
import { calculateStacking } from "../stacking";

export class EditorStackingProcessor extends EditorBeatmapProcessor
{
  constructor()
  {
    super(["stacking"]);
  }

  protected override process(beatmap: EditorBeatmap): void
  {
    calculateStacking(
        beatmap.hitObjects.unsafeCast<OsuHitObject>(),
        beatmap.beatmapInfo.stackLeniency,
        3,
        0,
        beatmap.hitObjects.length - 1,
    );
  }
}
