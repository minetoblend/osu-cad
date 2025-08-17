import { ComposeTool } from "@osucad/editor";
import type { ClickEvent, InputManager, KeyDownEvent, MouseDownEvent, MouseMoveEvent, MouseUpEvent } from "@osucad/framework";
import { dependencyLoader, Key, MouseButton, ObservableSet } from "@osucad/framework";
import type { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import type { HitObject } from "@osucad/core";
import type { OsuHitObject } from "../../../hitObjects";
import { OsuSelectionBlueprintContainer } from "./OsuSelectionBlueprintContainer";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";

export class SelectTool extends ComposeTool
{
  readonly selection = new ObservableSet<OsuHitObject>();

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

  #hoveredHitObjectsOnMouseDown: OsuHitObject[] = [];
  #draggingHitObjects?: OsuHitObject[];

  #performMouseDownSelectionActions(e: MouseDownEvent)
  {
    const blueprints = this.hoveredBlueprints;
    this.#hoveredHitObjectsOnMouseDown = blueprints.map(it => it.hitObject);

    if (blueprints.length > 0)
    {
      if (!e.controlPressed)
      {
        if (blueprints.some(it => it.selected))
          return;

        this.selection.clear();
      }

      this.selection.add(blueprints[0].hitObject);
    }
  }

  #getHitObjectsToRemove()
  {
    const blueprints = this.hoveredBlueprints;

    if (this.selection.size > 0 && blueprints.some(it => it.selected))
      return [...this.selection];

    if(blueprints.length > 0)
      return [blueprints[0].hitObject];

    return [];
  }

  override onMouseDown(e: MouseDownEvent): boolean
  {
    switch (e.button)
    {
    case MouseButton.Left:
      this.#performMouseDownSelectionActions(e);
      return true;
    case MouseButton.Right:
      this.#remove(this.#getHitObjectsToRemove());
      return true;
    default:
      return true;
    }
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

  #select(hitObject: HitObject)
  {
    this.selection.clear();
    this.selection.add(hitObject as OsuHitObject);
  }

  #remove(hitObjects: HitObject[])
  {
    if (hitObjects.length > 0)
    {
      for (const h of hitObjects)
        this.beatmap.hitObjects.remove(h);

      this.history.commit();
    }
  }

  override onMouseMove(e: MouseMoveEvent): boolean
  {
    if (this.#draggingHitObjects)
    {
      if (e.lastPosition)
      {
        const delta = this.playfield.toLocalSpace(e.screenSpaceMousePosition).sub(this.playfield.toLocalSpace(e.lastPosition));
        for (const h of this.#draggingHitObjects)
          h.position = h.position.add(delta);
      }
      return true;
    }

    if (this.#hoveredHitObjectsOnMouseDown.length > 0 && this.isMouseButtonPressed(MouseButton.Left))
    {
      this.#draggingHitObjects = [...this.selection];
      if (e.lastPosition)
      {
        const delta = this.playfield.toLocalSpace(e.screenSpaceMousePosition).sub(this.playfield.toLocalSpace(e.lastPosition));
        for (const h of this.#draggingHitObjects)
          h.position = h.position.add(delta);
      }
      return true;
    }

    return true;
  }

  override onMouseUp(e: MouseUpEvent): void
  {
    if (e.button === MouseButton.Left && this.#draggingHitObjects)
    {
      this.#draggingHitObjects = undefined;
      this.history.commit();
    }
  }
}
