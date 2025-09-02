import type { KeyDownEvent, MouseMoveEvent } from "@osucad/framework";
import { Anchor, Axes, Bindable, BindableBoolean, Box, dependencyLoader, Key, keyBindingHandler, PlatformAction, resolved, Vec2 } from "@osucad/framework";
import { ComposerStatusBar, HitObjectComposer, HitObjectSelection, Interaction } from "@osucad/editor";
import type { OsuHitObject } from "../../hitObjects";
import { Playfield } from "@osucad/core";
import { OsuOperatorUtils } from "../operators/OsuOperatorUtils";
import { MoveOperator } from "../operators/MoveOperator";


export class MoveInteraction extends Interaction
{
  #inputString = "";
  #statusBar!: ComposerStatusBar;

  #mousePosition!: Vec2;
  #mouseDelta = new Vec2();

  #xAxisMarker!: Box;
  #yAxisMarker!: Box;

  @resolved(HitObjectSelection)
  accessor #selection!: HitObjectSelection<OsuHitObject>;

  @resolved(Playfield)
  accessor #playfield!: Playfield;

  @resolved(HitObjectComposer)
  accessor #composer!: HitObjectComposer;

  @Interaction.toggleOnKeyDown("Minus")
  @Interaction.toggleOnKeyDown("KeypadMinus")
  private readonly negative = new BindableBoolean(false);

  @Interaction.toggleOnKey("Control")
  @Interaction.toggleOnKeyDown("Shift+Tab")
  private readonly snapped = new BindableBoolean(false);

  @Interaction.toggleOnKey("Shift")
  private readonly preciseMode = new BindableBoolean(false);

  private readonly axis = new Bindable<"x" | "y" | null>(null);

  @Interaction.invokeOnKey("X")
  private toggleXAxis()
  {
    this.axis.value = this.axis.value !== "x"
        ? "x"
        : null;
  }

  @Interaction.invokeOnKey("Y")
  private toggleYAxis()
  {
    this.axis.value = this.axis.value !== "y"
        ? "y"
        : null;
  }

  @dependencyLoader()
  #load()
  {
    this.internalChildren = [
      this.#xAxisMarker = new Box({
        relativeSizeAxes: Axes.X,
        height: 2,
        origin: Anchor.CenterLeft,
        color: 0xf75771,
        alpha: 0,
      }),
      this.#yAxisMarker = new Box({
        relativeSizeAxes: Axes.Y,
        width: 2,
        origin: Anchor.TopCenter,
        color: 0x55f267,
        alpha: 0,
      }),
      this.#statusBar = new ComposerStatusBar(),
    ];

    if (this.#selection.size === 0)
      this.expire();
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.#mousePosition = this.#playfield.toLocalSpace(this.getContainingInputManager()!.currentState.mouse.position);

    this.snapped.bindValueChanged(this.updateState, this);
    this.axis.bindValueChanged(this.updateState, this);
    this.negative.bindValueChanged(this.updateState, this);

    this.updateState();
  }

  protected override onKeyDown(e: KeyDownEvent): boolean
  {
    if (e.key.startsWith("Digit"))
    {
      const newValue = Number.parseInt(this.#inputString + e.key.substring("Digit".length));

      if (Number.isFinite(newValue))
      {
        this.#inputString = newValue.toString();
        this.updateState();
        return true;
      }
    }

    switch (e.key)
    {
    case Key.Period:
      if (!this.#inputString.includes("."))
        this.#inputString += ".";
      this.updateState();
      return true;
    }

    return super.onKeyDown(e);
  }

  @keyBindingHandler(PlatformAction.DeleteBackwardChar)
  private removeLastCharacter()
  {
    this.#inputString = this.#inputString.slice(0, -1);
    this.updateState();
  }

  protected override onMouseMove(e: MouseMoveEvent): boolean
  {
    const newPosition = this.#playfield.toLocalSpace(e.screenSpaceMousePosition);

    let delta = newPosition.sub(this.#mousePosition);

    this.#mousePosition = newPosition;

    if (this.preciseMode.value)
      delta = delta.scale(0.1);

    this.#mouseDelta = this.#mouseDelta.add(delta);

    this.updateState();

    return true;
  }

  private getMouseDelta(): Vec2
  {
    const delta = this.#mouseDelta.clone();

    switch (this.axis.value)
    {
    case "x":
      delta.y = 0;
      break;
    case "y":
      delta.x = 0;
      break;
    }

    if (this.snapped.value)
    {
      const gridSize = 32; // TODO

      delta.x = Math.round(delta.x / gridSize) * gridSize;
      delta.y = Math.round(delta.y / gridSize) * gridSize;
    }

    return delta;
  }

  private parseInputString(): Vec2 | null
  {
    if (this.#inputString.length === 0)
      return null;

    let value = Number.parseFloat(this.#inputString);

    if (!Number.isFinite(value))
      return null;

    if (this.negative.value)
      value = -value;

    switch (this.axis.value)
    {
    case "x":
      return new Vec2(value, 0);
    case "y":
      return new Vec2(0, value);
    default:
      return null;
    }
  }

  private updateState()
  {
    this.history.discardUncommittedChanges();

    if (this.#selection.size === 0)
    {
      this.expire();
      return;
    }

    const bounds = OsuOperatorUtils.getBounds(this.#selection);

    const delta = this.parseInputString() ?? this.getMouseDelta();

    if (bounds && this.axis.value)
    {
      const newPosition = this.#playfield.toSpaceOfOtherDrawable(bounds.center.add(delta), this);

      switch (this.axis.value)
      {
      case "x":
        this.#xAxisMarker.show();
        this.#yAxisMarker.hide();
        this.#xAxisMarker.y = newPosition.y;
        break;
      case "y":
        this.#xAxisMarker.hide();
        this.#yAxisMarker.show();
        this.#yAxisMarker.x = newPosition.x;
        break;
      }
    }
    else
    {
      this.#xAxisMarker.hide();
      this.#yAxisMarker.hide();
    }

    if (this.#inputString.length > 0 && this.axis.value !== null)
    {
      this.#statusBar.text = `[${this.negative.value ? "-" : ""}${this.#inputString}|] = ${this.#formatNumber(delta[this.axis.value])}px along ${this.axis.value.toUpperCase()} axis`;
    }
    else
    {
      if (this.axis.value !== null)
        this.#statusBar.text = `${this.#formatNumber(delta[this.axis.value])}px along ${this.axis.value.toUpperCase()} axis`;
      else
        this.#statusBar.text = `Dx: ${this.#formatNumber(delta.x)}px Dy: ${this.#formatNumber(delta.y)}px (${this.#formatNumber(delta.length())}px)`;
    }

    for (const h of this.#selection)
      h.moveBy(delta);
  }

  #formatNumber(value: number)
  {
    return value.toFixed(1);
  }

  protected override onComplete()
  {
    this.history.discardUncommittedChanges();

    const delta = this.parseInputString() ?? this.getMouseDelta();

    this.#composer.beginOperator(MoveOperator, [...this.#selection], delta);
  }
}
