import type { DrawableHitObject, HitObject } from "@osucad/core";
import type { ClickEvent } from "@osucad/framework";
import { PoolableDrawable, resolved } from "@osucad/framework";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";

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

  override get shouldBeAlive(): boolean
  {
    return this.selected || !!this.drawableHitObject;
  }

  override update(): void
  {
    super.update();
    this.alpha = this.selected ? 1 : 0;
  }

  override onClick(e: ClickEvent): boolean
  {
    this.selected = !this.selected;
    return true;
  }
}
