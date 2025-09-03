import { type HitObject } from "@osucad/core";
import { ComposeTool, HitObjectComposer, HitObjectSelection } from "@osucad/editor";
import type { ClickEvent, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, ReadonlyDependencyContainer } from "@osucad/framework";
import { Bindable, BoundsBuilder, DependencyContainer, dependencyLoader, keyBindingHandler, MouseButton, PlatformAction, provideSelf, resolved, Vec2 } from "@osucad/framework";
import type { SnapResult } from "src/edit/SnapProvider";
import { type OsuHitObject, Slider, Spinner } from "../../../hitObjects";
import { OsuEditorAction } from "../../OsuEditorAction";
import { HitObjectSnapProvider } from "../../SelectionSnapProvider";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { OsuSelectionBlueprintContainer } from "./OsuSelectionBlueprintContainer";
import { SelectBox } from "./SelectBox";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";
import { OsuPlayfield } from "../../../ui";
import { MoveOperator } from "../../operators/MoveOperator";
import { RotateOperator } from "../../operators/RotateOperator";
import { FlipOperator } from "../../operators/FlipOperator";
import { ReverseOperator } from "../../operators/ReverseOperator";
import type { SliderPathVisualizer } from "../slider/SliderPathVisualizer";
import { SliderSelectionBlueprint } from "./SliderSelectionBlueprint";
import { SelectToolSliderPathVisualizer } from "./SelectToolSliderPathVisualizer";
import { MoveInteraction } from "../../interactions/MoveInteraction";
import { RotateInteraction } from "../../interactions/RotateInteraction";

@provideSelf()
export class SelectTool extends ComposeTool implements IKeyBindingHandler<PlatformAction>
{
  @resolved(HitObjectSelection)
  public accessor selection!: HitObjectSelection<OsuHitObject>;

  public selectionContainer!: OsuSelectionBlueprintContainer;

  public snapProvider = new HitObjectSnapProvider();

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(dependencies: ReadonlyDependencyContainer)
  {
    return this.#dependencies = new DependencyContainer(dependencies);
  }

  @dependencyLoader()
  #load()
  {
    this.#dependencies.provide(
        SelectionBlueprintContainer,
        this.selectionContainer = new OsuSelectionBlueprintContainer(this.selection),
    );

    this.addRangeInternal([
      this.snapProvider,
      new SelectBox(),
      this.createPlayfieldAdjustmentContainer()
        .withChild(this.selectionContainer),
    ]);
  }

  readonly #hoveredSlider = new Bindable<Slider | undefined>(undefined);

  #sliderVisualizer?: SliderPathVisualizer;

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.beatmap.hitObjects.removed.addListener(this.#hitObjectRemoved, this);

    this.#hoveredSlider.bindValueChanged(e =>
    {
      this.#sliderVisualizer?.expire();
      this.#sliderVisualizer = undefined;

      if (e.value)
        this.addInternal(this.#sliderVisualizer = new SelectToolSliderPathVisualizer(e.value));
    });
  }

  protected override update()
  {
    super.update();

    const hoveredSliders = this.inputManager.hoveredDrawables.filter(it => it instanceof SliderSelectionBlueprint);

    let slider = hoveredSliders.find(it => it.selected)?.hitObject;
    if (!slider)
    {
      const selectedSliders = [...this.selectionContainer.allBlueprints.filter(it => it.selected && it.hitObject instanceof Slider)];
      if (selectedSliders.length === 1)
        slider = selectedSliders[0].hitObject as Slider;

      if (!slider)
        slider = hoveredSliders[0]?.hitObject;
    }


    this.#hoveredSlider.value = slider;
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
    switch (e.pressed)
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

  @resolved(HitObjectComposer)
  accessor #composer!: HitObjectComposer;

  public nudgeSelection(x: number, y: number)
  {
    const activeOperator = this.#composer.activeOperator;

    if (activeOperator instanceof MoveOperator)
    {
      activeOperator.movement = activeOperator.movement.add({ x, y });
      return;
    }

    this.#composer.beginOperator(MoveOperator, [...this.selection] as OsuHitObject[], new Vec2(x, y));
  }

  @keyBindingHandler(OsuEditorAction.ToggleNewCombo)
  public toggleNewCombo()
  {
    const objects = [...this.selection];

    if (objects.length === 0)
      return true;

    const newCombo = objects.some(it => !it.newCombo);

    for (const o of objects)
      o.newCombo = newCombo;

    this.history.commit();

    return true;
  }

  @keyBindingHandler([OsuEditorAction.NudgeForward, OsuEditorAction.NudgeBackward])
  #nudgeForward(e: KeyBindingPressEvent<OsuEditorAction>)
  {
    const objects = [...this.selection];
    if (objects.length === 0)
      return true;

    const direction = e.pressed === OsuEditorAction.NudgeForward ? 1 : -1;

    const firstObjectTime = Math.min(...objects.map(it => it.startTime));

    const timingPoint = this.beatmap.controlPointInfo.timingPointAt(firstObjectTime);

    let time = firstObjectTime + timingPoint.beatLength / this.beatDivisor.value * direction;

    time = this.beatmap.controlPointInfo.snap(time, this.beatDivisor.value);

    const offset = time - firstObjectTime;

    for (const o of objects)
      o.startTime += offset;

    this.history.commit();

    return true;
  }

  @keyBindingHandler(OsuEditorAction.MoveSelection)
  #moveSelection()
  {
    if (this.selection.size > 0)
      this.#composer.beginInteraction(new MoveInteraction());

    return true;
  }

  @keyBindingHandler(OsuEditorAction.Rotate)
  #rotate()
  {
    if (this.selection.size > 0)
      this.#composer.beginInteraction(new RotateInteraction());

    return true;
  }

  @keyBindingHandler(OsuEditorAction.NudgePosition)
  #nudgeSelection(event: KeyBindingPressEvent<OsuEditorAction.NudgePosition>)
  {
    this.nudgeSelection(event.pressed.x, event.pressed.y);

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

  @keyBindingHandler(OsuEditorAction.RotateSelection)
  #rotateSelection(e: KeyBindingPressEvent<OsuEditorAction.RotateSelection>)
  {
    const { angleDegrees, origin } = e.pressed;

    this.#composer.beginOperator(RotateOperator, [...this.selection], {
      angleDegrees,
      origin,
    });

    return true;
  }

  @keyBindingHandler(OsuEditorAction.FlipHorizontal)
  public flipHorizontal()
  {
    this.#composer.beginOperator(FlipOperator, [...this.selection], { horizontal: true });

    return true;
  }

  @keyBindingHandler(OsuEditorAction.FlipVertical)
  public flipVertical()
  {
    this.#composer.beginOperator(FlipOperator, [...this.selection], { vertical: true });

    return true;
  }

  @keyBindingHandler(OsuEditorAction.ReverseSelection)
  public reverseSelection()
  {
    this.#composer.beginOperator(ReverseOperator, [...this.selection]);

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
