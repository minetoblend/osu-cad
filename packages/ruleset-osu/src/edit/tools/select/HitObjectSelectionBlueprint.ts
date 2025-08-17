import type { DrawableHitObject, HitObject } from "@osucad/core";
import { PoolableDrawable, resolved } from "@osucad/framework";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import { EditorBeatmap, EditorHistory } from "@osucad/editor";

export class HitObjectSelectionBlueprint<T extends HitObject> extends PoolableDrawable
{
  constructor(readonly hitObject: T)
  {
    super();

    this.alwaysPresent = true;
  }

  #selected = false;

  get selected()
  {
    return this.#selected;
  }

  setSelected(selected: boolean)
  {
    this.#selected = selected;
    this.alpha = selected ? 1 : 0;
  }

  drawableBecameAlive(drawableHitObject: DrawableHitObject)
  {
  }

  drawableBecameDead(drawableHitObject: DrawableHitObject)
  {
  }

  @resolved(() => SelectionBlueprintContainer)
  protected accessor blueprintContainer!: SelectionBlueprintContainer<HitObject>

  @resolved(() => EditorBeatmap)
  protected accessor beatmap!: EditorBeatmap

  @resolved(EditorHistory)
  protected accessor history!: EditorHistory

  override get requestsPositionalInput()
  {
    return true;
  }
}
