import type { DrawableHitObject, HitObject } from "@osucad/core";
import type { ClickEvent, MouseDownEvent } from "@osucad/framework";
import { MouseButton, PoolableDrawable, resolved } from "@osucad/framework";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import { EditorBeatmap, EditorHistory } from "@osucad/editor";

export class HitObjectSelectionBlueprint<T extends HitObject> extends PoolableDrawable
{
  constructor(readonly hitObject: T)
  {
    super();

    this.alwaysPresent = true;
    this.alpha = 0;
  }

  selected = false;

  drawableHitObject: DrawableHitObject | null = null;

  @resolved(() => SelectionBlueprintContainer)
  protected accessor blueprintContainer!: SelectionBlueprintContainer

  @resolved(() => EditorBeatmap)
  protected accessor beatmap!: EditorBeatmap

  override get shouldBeAlive(): boolean
  {
    return this.selected || !!this.drawableHitObject;
  }

  override update(): void
  {
    super.update();
    this.alpha = this.selected ? 1 : 0;
  }

  @resolved(EditorHistory)
    protected accessor history!: EditorHistory

  override onMouseDown(e: MouseDownEvent): boolean
  {
    if (e.button === MouseButton.Right && !e.anyModifierPressed)
    {
      this.beatmap.hitObjects.remove(this.hitObject);
      this.history.commit();

      return true;
    }

    return false;
  }

  override onClick(e: ClickEvent): boolean
  {
    this.selected = !this.selected;
    return true;
  }
}
