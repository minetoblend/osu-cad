import type { HitObject } from "@osucad/core";
import { ComposeTool } from "@osucad/editor";
import type { ClickEvent, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyDownEvent, Vec2 } from "@osucad/framework";
import { DragEvent, PlatformAction } from "@osucad/framework";
import { dependencyLoader, Key, MouseButton, provide, provideSelf } from "@osucad/framework";
import type { OsuHitObject } from "../../../hitObjects";
import { HitObjectSelection } from "./HitObjectSelection";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { OsuSelectionBlueprintContainer } from "./OsuSelectionBlueprintContainer";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import { HitObjectSnapProvider } from "../../SelectionSnapProvider";
import type { SnapResult } from "src/edit/SnapProvider";
import { SelectBox } from "./SelectBox";

@provideSelf()
export class SelectTool extends ComposeTool implements IKeyBindingHandler<PlatformAction>
{
  @provide()
  readonly selection = new HitObjectSelection<OsuHitObject>();

  @provide(SelectionBlueprintContainer)
  selectionContainer = new OsuSelectionBlueprintContainer(this.selection);

  snapProvider = new HitObjectSnapProvider();

  @dependencyLoader()
  #load()
  {
    this.addRangeInternal([
      this.snapProvider,
      new SelectBox(),
      this.createPlayfieldAdjustmentContainer()
        .withChild(this.selectionContainer),
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

  moveObjects(movement: Vec2, objects: OsuHitObject[], startPositions: Vec2[])
  {
    for (let i = 0; i < objects.length; i++)
      objects[i].position = startPositions[i].add(movement);

    const snapTargets = objects.flatMap((it, index) => it.getSnapTargets());

    let closestDistance = Number.MAX_VALUE;
    let closest: SnapResult | undefined;
    for (const result of this.snapProvider.getSnapResults(snapTargets, { ignore: objects }))
    {
      const dist = result.distance;
      if (dist < closestDistance)
      {
        closestDistance = dist;
        closest = result;
      }
    }

    if (closest && closest.distance < 5)
    {
      for (let i = 0; i < objects.length; i++)
      {
        objects[i].position = objects[i].position.add(closest.offset);
      }
    }
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean
  {
    return true;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean
  {
    switch(e.pressed)
    {
    case PlatformAction.SelectAll:
      this.selection.addRange(this.hitObjects as Iterable<OsuHitObject>);
      return true;
    case PlatformAction.Delete:
      this.hitObjects.removeRange(this.selection);
      this.history.commit();
      return true;
    }

    return false;
  }
}
