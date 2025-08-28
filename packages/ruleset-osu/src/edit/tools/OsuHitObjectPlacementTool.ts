import type { OsuHitObject } from "src/hitObjects";
import { HitObjectPlacementTool } from "./HitObjectPlacementTool";
import { resolved } from "@osucad/framework";
import { EditorComboProcessor } from "../EditorComboProcessor";

export abstract class OsuHitObjectPlacementTool<T extends OsuHitObject> extends HitObjectPlacementTool<T>
{
  @resolved(EditorComboProcessor)
  accessor #comboProcessor!: EditorComboProcessor

  protected override loadComplete()
  {
    super.loadComplete();

    this.#comboProcessor.refresh(true);
  }
}
