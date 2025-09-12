import type { DrawableHitObject, HitObject, HitObjectLifetimeEntry } from "@osucad/core";
import { PoolableDrawableWithLifetime } from "@osucad/core";
import type { MouseDownEvent, Rectangle } from "@osucad/framework";
import { MouseButton, resolved } from "@osucad/framework";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import { EditorBeatmap, EditorHistory, HitObjectSelection } from "@osucad/editor";

export class HitObjectSelectionBlueprint<out T extends HitObject> extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry>
{
  public constructor(entry?: HitObjectLifetimeEntry)
  {
    super(entry);

    this.alwaysPresent = true;
  }

  public get hitObject(): T
  {
    return this.entry!.hitObject as T;
  }

  @resolved(HitObjectSelection as typeof HitObjectSelection)
  protected accessor selection!: HitObjectSelection<HitObject>;

  #selected = false;

  public get selected()
  {
    return this.#selected;
  }

  public setSelected(selected: boolean)
  {
    this.#selected = selected;
    this.alpha = selected ? 1 : 0;
  }

  public drawableBecameAlive(drawableHitObject: DrawableHitObject)
  {
  }

  public drawableBecameDead(drawableHitObject: DrawableHitObject)
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

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    if (e.button === MouseButton.Left)
    {
      if (!this.selected && this.getContainingInputManager()?.hoveredDrawables.some(bp =>
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

  public select()
  {
    return this.selection.add(this.hitObject);
  }

  public deselect()
  {
    return this.selection.remove(this.hitObject);
  }

  public selectExclusive()
  {
    if (this.selection.size === 1 && this.#selected)
      return;

    this.selection.clear();
    this.selection.add(this.hitObject);
  }

  public isInSelectionRect(rectangle: Rectangle)
  {
    return false;
  }
}
