import type { EditorBeatmap } from "@osucad/editor";
import { EditorBeatmapProcessor } from "@osucad/editor";
import { type OsuHitObject } from "src/hitObjects";

export class EditorComboProcessor extends EditorBeatmapProcessor
{
  constructor()
  {
    super(["combo"]);
  }

  protected override process(beatmap: EditorBeatmap): void
  {
    let lastObj: OsuHitObject | undefined;

    for (const hitObject of beatmap.hitObjects.unsafeCast<OsuHitObject>())
    {
      hitObject.updateComboInformation(lastObj);
      lastObj = hitObject;
    }
  }
}
