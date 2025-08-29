import type { HitObject } from "@osucad/core";
import type { EditorBeatmap } from "@osucad/editor";
import { EditorBeatmapProcessor } from "@osucad/editor";
import { type OsuHitObject } from "src/hitObjects";

export class EditorComboProcessor extends EditorBeatmapProcessor
{
  public constructor()
  {
    super(["combo"]);
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
    let lastObj: OsuHitObject | undefined;

    for (const hitObject of beatmap.hitObjects.unsafeCast<OsuHitObject>())
    {
      hitObject.updateComboInformation(lastObj);
      lastObj = hitObject;
    }
  }
}
