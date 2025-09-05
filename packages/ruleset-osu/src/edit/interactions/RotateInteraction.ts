import { Playfield } from "@osucad/core";
import { ComposerStatusBar, EditorHistory, HitObjectComposer, HitObjectSelection, HotkeyBar, Interaction } from "@osucad/editor";
import type { Drawable, MouseMoveEvent } from "@osucad/framework";
import { Anchor, Axes, Bindable, BindableBoolean, Box, Container, dependencyLoader, resolved, Vec2 } from "@osucad/framework";
import { Color, Matrix } from "pixi.js";
import { Slider, Spinner, type OsuHitObject } from "../../hitObjects";
import { OsuPlayfield } from "../../ui";
import { OsuOperatorUtils } from "../operators/OsuOperatorUtils";
import { DashedLine } from "./DashedLine";
import { PickPointInteraction } from "./PickPointInteraction";

export type TransformOrigin =
  | { type: "custom", value: Vec2 }
  | { type: "playfield_center" }
  | { type: "selection_center" };

export class RotateInteraction extends Interaction
{
  @resolved(HitObjectSelection)
  accessor #selection!: HitObjectSelection<OsuHitObject>;

  @resolved(EditorHistory)
  accessor #history!: EditorHistory

  @resolved(Playfield)
  accessor #playfield!: Playfield

  @resolved(HitObjectComposer)
  accessor #composer!: HitObjectComposer

  @Interaction.inputNumberString()
  private readonly stringValue = new Bindable<string>("");

  #cumulativeAngle = 0;

  #lineToCursor: DashedLine;
  #statusBar: ComposerStatusBar;
  #originBox!: Drawable;

  public constructor()
  {
    super();

    this.internalChildren = [
      this.#statusBar = new ComposerStatusBar(),
      this.#lineToCursor = new DashedLine().with({
        alpha: 0.5,
      }),
      this.#originBox = new Container({
        size: 8,
        origin: Anchor.Center,
        masking: true,
        borderThickness: 3,
        borderColor: new Color(0xffffff).setAlpha(0.5),
        child: new Box({
          relativeSizeAxes: Axes.Both,
          alpha: 0.25,
        }),
      }),
    ];
  }

  @Interaction.invertOnKey("Shift", "Precision Mode")
  private readonly precise = new BindableBoolean(false);

  @Interaction.invertOnKey("Control", "Snap Invert")
  @Interaction.toggleOnKeyDown("Shift+Tab", "Snap")
  private readonly snapped = new BindableBoolean(false);

  private readonly transformOrigin = new Bindable<TransformOrigin>({ type: "playfield_center" });

  @Interaction.invokeOnKey("B", "Pick Rotation Origin")
  #pickOrigin()
  {
    this.#history.discardUncommittedChanges();

    this.push(new PickPointInteraction()).then(result =>
    {
      if (result)
        this.transformOrigin.value = { type: "custom", value: result };

      this.#lastMousePosition = undefined;
      this.#cumulativeAngle = 0;
    });
  }

  @Interaction.invokeOnKey("P", "Rotate around Playfield Center")
  #setOriginToPlayfieldCenter()
  {
    this.transformOrigin.value = { type: "playfield_center" };
  }

  @Interaction.invokeOnKey("S", "Rotate around Selection Center")
  #setOriginToSelectionCenter()
  {
    if (OsuOperatorUtils.getBounds(this.#selection)?.size.isZero !== false)
      return;

    this.transformOrigin.value = { type: "selection_center" };
  }

  @dependencyLoader()
  #load()
  {
    this.addInternal(new HotkeyBar(this));
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.transformOrigin.bindValueChanged(this.#updateState, this);
    this.snapped.bindValueChanged(this.#updateState, this);
    this.stringValue.bindValueChanged(this.#updateState, this);

    this.invalidateState();
  }

  private resolveOrigin()
  {
    const origin = this.transformOrigin.value;

    switch(origin.type)
    {
    case "custom":
      return origin.value;
    case "playfield_center":
      return OsuPlayfield.BOUNDS.center;
    case "selection_center":
      return OsuOperatorUtils.getBounds(this.#selection)?.center ?? OsuPlayfield.BOUNDS.center;
    }
  }

  #lastMousePosition?: Vec2;

  protected override onMouseMove(e: MouseMoveEvent): boolean
  {
    if (!this.screenStack?.isCurrentScreen(this))
      return true;

    const position = this.#playfield.toLocalSpace(e.screenSpaceMousePosition);

    if (!this.#lastMousePosition)
    {
      this.#lastMousePosition = position;
      return true;
    }

    const lastPosition = this.#lastMousePosition;


    const origin = this.#lastOrigin;

    const lastAngle = lastPosition.sub(origin).angle();
    const angle = position.sub(origin).angle();

    let delta = angle - lastAngle;

    if (delta > Math.PI)
      delta -= Math.PI * 2;
    if (delta < -Math.PI)
      delta += Math.PI * 2;

    if (this.precise.value)
      delta *= 0.1;

    this.#cumulativeAngle += delta;

    this.#updateState();

    this.#lastMousePosition = position;

    return true;
  }

  #lastOrigin!: Vec2;
  #needsUpdate = true;

  private invalidateState()
  {
    this.#needsUpdate = true;
  }

  protected override update(): void
  {
    super.update();

    if (this.#needsUpdate)
    {
      this.#updateState();
      this.#needsUpdate = false;
    }
  }

  #updateState()
  {
    this.#history.discardUncommittedChanges();

    const origin = this.#lastOrigin = this.resolveOrigin();

    this.#originBox.position = this.#playfield.toSpaceOfOtherDrawable(origin, this);

    let angle = this.#cumulativeAngle;

    if (this.snapped.value)
    {
      const snapAngle = Math.PI / 12;

      angle = Math.round(angle / snapAngle) * snapAngle;
    }

    if (this.stringValue.value.length > 0)
    {
      const value = Number.parseFloat(this.stringValue.value);
      if (Number.isFinite(value))
        angle = value / 180 * Math.PI;
    }

    const transform = new Matrix()
      .translate(-origin.x, -origin.y)
      .rotate(angle)
      .translate(origin.x, origin.y);

    const pathTransform = new Matrix().rotate(angle);

    if (this.#lastMousePosition)
    {
      this.#lineToCursor.startPosition = this.#playfield.toSpaceOfOtherDrawable(origin, this);
      this.#lineToCursor.endPosition = this.#playfield.toSpaceOfOtherDrawable(this.#lastMousePosition, this);
    }

    const angleDegrees = (angle * 180 / Math.PI) % 360;

    if (this.stringValue.value.length > 0)
    {
      this.#statusBar.text = `[${this.stringValue.value}|] = ${Math.round(angleDegrees * 10) / 10}°`;
    }
    else
    {
      this.#statusBar.text = `${Math.round(angleDegrees * 10) / 10}°` + (this.snapped.value ? " (snapped)" : "");
    }

    for (const obj of this.#selection)
    {
      if (obj instanceof Spinner)
        continue;

      obj.position = transform.apply(obj.position, new Vec2());

      if (obj instanceof Slider)
        obj.applyToPath(p => p.transform(pathTransform));
    }
  }
}
