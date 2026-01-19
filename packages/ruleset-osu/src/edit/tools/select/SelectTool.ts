import { type HitObject } from "@osucad/core";
import type { HotkeyKeyBindingEvent } from "@osucad/editor";
import { ComposeTool, HitObjectComposer, HitObjectSelection, Hotkeys } from "@osucad/editor";
import type { ClickEvent } from "@osucad/framework";
import { Bindable, BoundsBuilder, MouseButton, PlatformAction, provideSelf, resolved, Vec2 } from "@osucad/framework";
import { type OsuHitObject, Slider, Spinner } from "../../../hitObjects";
import { OsuEditorAction } from "../../OsuEditorAction";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { OsuPlayfield } from "../../../ui";
import { MoveOperator } from "../../operators/MoveOperator";
import { RotateOperator } from "../../operators/RotateOperator";
import { FlipOperator } from "../../operators/FlipOperator";
import { ReverseOperator } from "../../operators/ReverseOperator";
import type { SliderPathVisualizer } from "../slider/SliderPathVisualizer";
import { SliderSelectionBlueprint } from "./SliderSelectionBlueprint";
import { SelectToolSliderPathVisualizer } from "./SelectToolSliderPathVisualizer";
import { SelectToolPresenceOverlay } from "./SelectToolPresenceOverlay";
import iconUrl from "./icon.png";
import { OsuSelectionBlueprintContainer } from "./OsuSelectionBlueprintContainer";
import { RotateTool } from "../rotate/RotateTool";
import { MoveTool } from "../move/MoveTool";
import { ScaleTool } from "../scale/ScaleTool";

@ComposeTool.metadata({
  id: "select",
  label: "Select",
  icon: iconUrl,
  presenceOverlay: SelectToolPresenceOverlay,
})
@provideSelf()
export class SelectTool extends ComposeTool
{
  public override get keepVisible(): boolean
  {
    return true;
  }

  @resolved(HitObjectSelection)
  public accessor selection!: HitObjectSelection<OsuHitObject>;

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

  @resolved(OsuSelectionBlueprintContainer)
  accessor #selectionContainer!: OsuSelectionBlueprintContainer

  protected override update()
  {
    super.update();

    const hoveredSliders = this.inputManager.hoveredDrawables.filter(it => it instanceof SliderSelectionBlueprint);

    let slider = hoveredSliders.find(it => it.selected)?.hitObject;
    if (!slider)
    {
      const selectedSliders = [...this.#selectionContainer.allBlueprints.filter(it => it.selected && it.hitObject instanceof Slider)];
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
    if (this.hoveredBlueprints.length === 0)
      this.selection.clear();

    return true;
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

  @Hotkeys.keyBinding(PlatformAction.SelectAll)
  public selectAll()
  {
    this.selection.addRange(this.hitObjects as Iterable<OsuHitObject>);
  }

  @Hotkeys.keyBinding(PlatformAction.Delete)
  public deleteSelection()
  {
    this.hitObjects.removeRange(this.selection);
    this.history.commit();
  }

  @Hotkeys.keyBinding(OsuEditorAction.ToggleNewCombo, { label: "New combo" })
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

  @Hotkeys.keyBinding(OsuEditorAction.NudgeForward, { label: "Nudge forward" })
  @Hotkeys.keyBinding(OsuEditorAction.NudgeBackward, { label: "Nudge backward" })
  #nudgeStartTime(e: HotkeyKeyBindingEvent)
  {
    const objects = [...this.selection];
    if (objects.length === 0)
      return true;

    const direction = e.action === OsuEditorAction.NudgeForward ? 1 : -1;

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

  @Hotkeys.keyBinding(OsuEditorAction.MoveSelection, { label: "Move" })
  #moveSelection()
  {
    if (this.selection.size > 0)
      void this.push(new MoveTool());
  }

  @Hotkeys.keyBinding(OsuEditorAction.Rotate, { label: "Rotate" })
  #rotate()
  {
    if (this.selection.size > 0)
      this.toolContainer.push(new RotateTool());
  }

  @Hotkeys.keyBinding(OsuEditorAction.Scale, { label: "Scale" })
  #scale()
  {
    if (this.selection.size > 0)
      this.toolContainer.push(new ScaleTool());
  }

  @Hotkeys.keyBinding(OsuEditorAction.NudgePosition)
  #nudgeSelection(event: HotkeyKeyBindingEvent<OsuEditorAction.NudgePosition>)
  {
    this.nudgeSelection(event.action.x, event.action.y);
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
        h.controlPoints = h.controlPoints.map(p => p.rotated(angle));
    }

    this.history.commit();
  }

  @Hotkeys.keyBinding(OsuEditorAction.RotateSelection)
  #rotateSelection(e: HotkeyKeyBindingEvent<OsuEditorAction.RotateSelection>)
  {
    const { angleDegrees, origin } = e.action;

    this.#composer.beginOperator(RotateOperator, [...this.selection], {
      angleDegrees,
      origin,
    });

    return true;
  }

  @Hotkeys.keyBinding(OsuEditorAction.FlipHorizontal, { label: "Flip horizontal" })
  public flipHorizontal()
  {
    this.#composer.beginOperator(FlipOperator, [...this.selection], { horizontal: true });

    return true;
  }

  @Hotkeys.keyBinding(OsuEditorAction.FlipVertical, { label: "Flip vertical" })
  public flipVertical()
  {
    this.#composer.beginOperator(FlipOperator, [...this.selection], { vertical: true });

    return true;
  }

  @Hotkeys.keyBinding(OsuEditorAction.ReverseSelection, { label: "Reverse" })
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

  public override dispose()
  {
    this.beatmap.hitObjects.removed.removeListener(this.#hitObjectRemoved, this);

    super.dispose();
  }
}
