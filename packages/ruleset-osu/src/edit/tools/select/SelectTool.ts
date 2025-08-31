import { DrawableRuleset, type HitObject } from "@osucad/core";
import { ComposeTool } from "@osucad/editor";
import type { ClickEvent, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent } from "@osucad/framework";
import { Vec2 } from "@osucad/framework";
import { BoundsBuilder, dependencyLoader, keyBindingHandler, MouseButton, PlatformAction, provide, provideSelf, resolved } from "@osucad/framework";
import type { SnapResult } from "src/edit/SnapProvider";
import { Slider, Spinner, type OsuHitObject } from "../../../hitObjects";
import { OsuEditorAction } from "../../OsuEditorAction";
import { HitObjectSnapProvider } from "../../SelectionSnapProvider";
import { HitObjectSelection } from "./HitObjectSelection";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { OsuSelectionBlueprintContainer } from "./OsuSelectionBlueprintContainer";
import { SelectBox } from "./SelectBox";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import { OsuPlayfield } from "../../../ui";

@provideSelf()
export class SelectTool extends ComposeTool implements IKeyBindingHandler<PlatformAction>
{
  @provide()
  public readonly selection = new HitObjectSelection<OsuHitObject>();

  @provide(SelectionBlueprintContainer)
  public selectionContainer = new OsuSelectionBlueprintContainer(this.selection);

  @resolved(DrawableRuleset)
  accessor #drawableRuleset!: DrawableRuleset

  public snapProvider = new HitObjectSnapProvider();

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

  public override getPresence()
  {
    const mousePosition = this.playfieldMousePosition;

    return {
      buttons: {
        left: this.isMouseButtonPressed(MouseButton.Left),
      },
      position: mousePosition.round(),
    };
  }

  public override dispose()
  {
    this.beatmap.hitObjects.removed.removeListener(this.#hitObjectRemoved, this);

    super.dispose();
  }

  public get hoveredBlueprints()
  {
    return this.inputManager.hoveredDrawables.filter(it => it instanceof HitObjectSelectionBlueprint) as HitObjectSelectionBlueprint<OsuHitObject>[];
  }

  public cycleSelection(source: HitObjectSelectionBlueprint<OsuHitObject>)
  {
    const blueprints = this.hoveredBlueprints;

    if (blueprints.length <= 1)
      return;

    const index = blueprints.indexOf(source);
    const newIndex = (index + 1) % blueprints.length;
    blueprints[newIndex]?.selectExclusive();
  }

  protected override onClick(e: ClickEvent): boolean
  {
    const blueprints = this.inputManager.hoveredDrawables.filter(it => it instanceof HitObjectSelectionBlueprint);

    if (blueprints.length === 0)
    {
      this.selection.clear();
      return true;
    }

    return true;
  }

  public moveObjects(movement: Vec2, objects: OsuHitObject[], startPositions: Vec2[])
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
      const { offset } = closest;

      for (let i = 0; i < objects.length; i++)
        objects[i].moveBy(offset.x, offset.y);
    }

    this.moveIntoBounds(objects);
  }

  public readonly isKeyBindingHandler = true;

  public canHandleKeyBinding(binding: KeyBindingAction): boolean
  {
    return true;
  }

  public onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean
  {
    switch(e.pressed)
    {
    case PlatformAction.SelectAll:
      this.selection.addRange(this.hitObjects as Iterable<OsuHitObject>);
      return true;
    case PlatformAction.Delete:
    case PlatformAction.DeleteBackwardChar:
      this.hitObjects.removeRange(this.selection);
      this.history.commit();
      return true;
    }

    return false;
  }

  public nudgeSelection(x: number, y: number)
  {
    for (const h of this.selection)
      h.moveBy(x, y);

    this.moveIntoBounds([...this.selection]);

    this.history.commit();
  }

  @keyBindingHandler([
    OsuEditorAction.NudgeLeft,
    OsuEditorAction.NudgeRight,
    OsuEditorAction.NudgeUp,
    OsuEditorAction.NudgeDown,
  ])
  #nudgeSelection(event: KeyBindingPressEvent<OsuEditorAction>)
  {
    switch(event.pressed)
    {
    case OsuEditorAction.NudgeLeft:
      this.nudgeSelection(-1, 0);
      break;
    case OsuEditorAction.NudgeRight:
      this.nudgeSelection(1, 0);
      break;
    case OsuEditorAction.NudgeUp:
      this.nudgeSelection(0, -1);
      break;
    case OsuEditorAction.NudgeDown:
      this.nudgeSelection(0, 1);
      break;
    }

    return true;
  }

  public rotateSelection(angle: number, center: Vec2)
  {
    for (const h of this.selection)
    {
      if (h instanceof Spinner)
        continue;

      h.position = h.position
        .sub(center)
        .rotate(angle)
        .add(center);

      if (h instanceof Slider)
      {
        h.path.controlPoints = h.path.controlPoints.map(p => p.rotated(angle));
      }
    }



    this.history.commit();
  }

  @keyBindingHandler(OsuEditorAction.RotateClockwise)
  public rotateClockwise()
  {
    this.rotateSelection(Math.PI / 2, OsuPlayfield.BOUNDS.center);

    return true;
  }

  @keyBindingHandler(OsuEditorAction.RotateCounterClockwise)
  public rotateCounterClockwise()
  {
    this.rotateSelection(-Math.PI / 2, OsuPlayfield.BOUNDS.center);

    return true;
  }

  @keyBindingHandler(OsuEditorAction.FlipHorizontal)
  public flipHorizontal()
  {
    for (const h of this.selection)
    {
      if (h instanceof Spinner)
        continue;

      h.x = OsuPlayfield.SIZE.x - h.x;

      if (h instanceof Slider)
      {
        h.path.controlPoints = h.path.controlPoints.map(p => p.withPosition(p.position.mul({ x: -1, y: 1 })));
      }
    }
    this.history.commit();

    return true;
  }

  @keyBindingHandler(OsuEditorAction.FlipHorizontal)
  public flipVertical()
  {
    for (const h of this.selection)
    {
      if (h instanceof Spinner)
        continue;

      h.y = OsuPlayfield.SIZE.y - h.y;

      if (h instanceof Slider)
      {
        h.path.controlPoints = h.path.controlPoints.map(p => p.withPosition(p.position.mul({ x: 1, y: -1 })),
        );
      }
    }
    this.history.commit();

    return true;
  }

  public moveIntoBounds(hitObjects: OsuHitObject[])
  {
    const bounds = new BoundsBuilder();

    for (const h of hitObjects)
    {
      if (h instanceof Spinner)
        continue;

      bounds.addPoint(h.position);

      if (h instanceof Slider)
        bounds.addPoint(h.pathEndPosition);
    }

    const rect = bounds.rect();

    if (!rect)
      return;

    const offset = new Vec2();

    if (rect.left < 0 && rect.right < OsuPlayfield.BOUNDS.right)
      offset.x = -rect.left;

    if (rect.left > 0 && rect.right > OsuPlayfield.BOUNDS.right)
      offset.x = OsuPlayfield.BOUNDS.right - rect.right;

    if (rect.top < 0 && rect.bottom < OsuPlayfield.BOUNDS.bottom)
      offset.y = -rect.top;

    if (rect.top > 0 && rect.bottom > OsuPlayfield.BOUNDS.bottom)
      offset.y = OsuPlayfield.BOUNDS.bottom - rect.bottom;

    if (!offset.isZero)
    {
      for (const h of hitObjects)
        h.moveBy(offset.x, offset.y);
    }
  }
}
