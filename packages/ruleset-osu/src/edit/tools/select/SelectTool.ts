import { ComposeTool } from "@osucad/editor";
import type { ClickEvent, DragEvent, KeyDownEvent, MouseDownEvent, MouseMoveEvent, MouseUpEvent } from "@osucad/framework";
import { dependencyLoader, Key, MouseButton, ObservableSet, provide, provideSelf } from "@osucad/framework";
import type { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import type { HitObject } from "@osucad/core";
import type { OsuHitObject } from "../../../hitObjects";
import { OsuSelectionBlueprintContainer } from "./OsuSelectionBlueprintContainer";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { HitObjectSelection } from "./HitObjectSelection";

@provideSelf()
export class SelectTool extends ComposeTool
{
  @provide()
  readonly selection = new HitObjectSelection<OsuHitObject>();

  selectionContainer!: SelectionBlueprintContainer<OsuHitObject>;

  @dependencyLoader()
  #load()
  {
    this.addRangeInternal([
      this.createPlayfieldAdjustmentContainer()
        .withChild(this.selectionContainer = new OsuSelectionBlueprintContainer(this.selection)),
    ]);
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.beatmap.hitObjects.removed.addListener(this.#hitObjectRemoved, this);
  }

  #hitObjectRemoved(hitObject: HitObject)
  {
    this.selection.remove(hitObject as OsuHitObject);
  }

  override getPresence()
  {
    const mousePosition = this.playfieldMousePosition;

    return {
      buttons: {
        left: this.isMouseButtonPressed(MouseButton.Left),
      },
      mousePosition: {
        x: Math.round(mousePosition.x),
        y: Math.round(mousePosition.y),
      },
    };
  }

  override dispose()
  {
    this.beatmap.hitObjects.removed.removeListener(this.#hitObjectRemoved, this);

    super.dispose();
  }

  get hoveredBlueprints()
  {
    return this.inputManager.hoveredDrawables.filter(it => it instanceof HitObjectSelectionBlueprint) as HitObjectSelectionBlueprint<OsuHitObject>[];
  }

  cycleSelection(source: HitObjectSelectionBlueprint<OsuHitObject>)
  {
    const blueprints = this.hoveredBlueprints;

    if (blueprints.length <= 1)
      return;

    const index = blueprints.indexOf(source);
    const newIndex = (index + 1) % blueprints.length;
    blueprints[newIndex]?.selectExclusive();
  }

  override onClick(e: ClickEvent): boolean
  {
    const blueprints = this.inputManager.hoveredDrawables.filter(it => it instanceof HitObjectSelectionBlueprint);

    if (blueprints.length === 0)
    {
      this.selection.clear();
      return true;
    }

    return true;
  }

  moveFromDrag(e: DragEvent, objects: OsuHitObject[])
  {
    const delta = e.delta;

    for (const d of objects)
      d.position = d.position.add(delta);
  }

  override onKeyDown(e: KeyDownEvent): boolean
  {
    if (e.key === Key.KeyA && e.controlPressed)
    {
      this.selection.addRange(this.hitObjects as Iterable<OsuHitObject>);
      return true;
    }

    if (e.key === Key.Delete || e.key === Key.Backspace)
    {
      this.hitObjects.removeRange(this.selection);
      this.history.commit();
      return true;
    }

    if (e.key === Key.KeyZ && e.controlPressed)
    {
      this.history.undo();
      return true;
    }

    return false;
  }
}
