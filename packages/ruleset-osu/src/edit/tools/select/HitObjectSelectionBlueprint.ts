import type { DrawableHitObject, HitObject } from "@osucad/core";
import type { ClickEvent, MouseDownEvent } from "@osucad/framework";
import { MouseButton, PoolableDrawable, resolved } from "@osucad/framework";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import { EditorBeatmap } from "@osucad/editor";

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

  override onMouseDown(e: MouseDownEvent): boolean
  {
    if (e.button === MouseButton.Right)
    {
      this.beatmap.hitObjects.remove(this.hitObject);
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
