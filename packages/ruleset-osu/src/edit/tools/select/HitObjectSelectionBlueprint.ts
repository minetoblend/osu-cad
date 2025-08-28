import type { DrawableHitObject, HitObject } from "@osucad/core";
import type { MouseDownEvent, Rectangle } from "@osucad/framework";
import { MouseButton, PoolableDrawable, resolved } from "@osucad/framework";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import { EditorBeatmap, EditorHistory } from "@osucad/editor";
import { HitObjectSelection } from "./HitObjectSelection";

export class HitObjectSelectionBlueprint<out T extends HitObject> extends PoolableDrawable
{
  constructor(readonly hitObject: T)
  {
    super();

    this.alwaysPresent = true;
  }

  @resolved(HitObjectSelection as typeof HitObjectSelection)
  protected accessor selection!: HitObjectSelection<HitObject>;

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

  protected performMouseDownSelectionActions(e: MouseDownEvent)
  {
    if (e.controlPressed)
    {
      this.selection.toggle(this.hitObject);
      return;
    }

    if (!this.selected)
      this.selectExclusive();
  }

  override onMouseDown(e: MouseDownEvent): boolean
  {
    if (e.button === MouseButton.Left)
    {
      if (this.getContainingInputManager()?.hoveredDrawables.some(bp =>
        bp instanceof HitObjectSelectionBlueprint
        && bp.selected
        && bp !== this,
      ))
      {
        return false;
      }

      this.performMouseDownSelectionActions(e);
      return true;
    }

    if (e.button === MouseButton.Right)
    {
      if (this.selected)
        this.beatmap.hitObjects.removeRange(this.selection);
      else
        this.beatmap.hitObjects.remove(this.hitObject);

      this.history.commit();

      return true;
    }

    return false;
  }

  select()
  {
    return this.selection.add(this.hitObject);
  }

  deselect()
  {
    return this.selection.remove(this.hitObject);
  }

  selectExclusive()
  {
    if (this.selection.size === 1 && this.#selected)
      return;

    this.selection.clear();
    this.selection.add(this.hitObject);
  }

  isInSelectionRect(rectangle: Rectangle)
  {
    return false;
  }
}
