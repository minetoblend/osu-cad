import type { EditorBeatmap } from "@osucad/editor";
import { EditorBeatmapProcessor } from "@osucad/editor";
import type { OsuHitObject } from "../hitObjects";
import { calculateStacking } from "../stacking";
import type { HitObject } from "@osucad/core";

export class EditorStackingProcessor extends EditorBeatmapProcessor
{
  constructor()
  {
    super(["stacking"]);
  }

  protected override onHitObjectAdded(hitObject: HitObject): void
  {
    this.refresh();
  }

  protected override onHitObjectRemoved(hitObject: HitObject): void
  {
    this.refresh();
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
