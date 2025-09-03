import { Playfield } from "@osucad/core";
import { ComposerStatusBar, HitObjectComposer, HitObjectSelection, HotkeyBar, Interaction } from "@osucad/editor";
import type { InputManager, KeyDownEvent, MouseMoveEvent } from "@osucad/framework";
import { InputKey } from "@osucad/framework";
import { Anchor, Axes, Bindable, BindableBoolean, Box, dependencyLoader, Key, keyBindingHandler, MouseButton, PlatformAction, resolved, Vec2 } from "@osucad/framework";
import type { OsuHitObject } from "../../hitObjects";
import { MoveOperator } from "../operators/MoveOperator";
import { OsuOperatorUtils } from "../operators/OsuOperatorUtils";
import { PickSnapTargetsInteraction } from "./PickSnapTargetsInteraction";
import { SnapTargetContainer } from "./SnapTargetContainer";

export interface MoveInteractionOptions
{
  completeOnMouseUp?: boolean
}

export class MoveInteraction extends Interaction
{
  public completeOnMouseUp = false;

  public constructor(options: MoveInteractionOptions = {})
  {
    super();

    const {
      completeOnMouseUp = false,
    } = options;

    this.completeOnMouseUp = completeOnMouseUp;
  }

  #needsUpdate = false;

  #inputString = "";
  #mousePosition!: Vec2;
  #mouseDelta = new Vec2();
  #lastDelta = Vec2.zero();

  #xAxisMarker!: Box;
  #yAxisMarker!: Box;
  #statusBar!: ComposerStatusBar;
  #snapTargetContainer!: SnapTargetContainer;
  #snapTargets: Vec2[] = [];

  #inputManager!: InputManager;

  @resolved(HitObjectSelection)
  accessor #selection!: HitObjectSelection<OsuHitObject>;

  @resolved(Playfield)
  accessor #playfield!: Playfield;

  @resolved(HitObjectComposer)
  accessor #composer!: HitObjectComposer;

  @Interaction.toggleOnKeyDown("Minus")
  @Interaction.toggleOnKeyDown("KeypadMinus")
  private readonly negative = new BindableBoolean(false);

  @Interaction.toggleOnKeyDown("T", "Grid Snap")
  private readonly snapped = new BindableBoolean(false);

  @Interaction.toggleOnKey("Shift", "Precision Mode")
  private readonly preciseMode = new BindableBoolean(false);

  private readonly axis = new Bindable<"x" | "y" | null>(null);

  @Interaction.invokeOnKey({ or: ["X", "Y"] }, "Axis")
  private toggleAxis(key: InputKey)
  {
    const axis = key === InputKey.X ? "x" : "y";

    this.axis.value = this.axis.value !== axis
        ? axis
        : null;
  }

  @Interaction.invokeOnKey("B", "Pick Snap Targets")
  private pickSnapTargets()
  {
    this.history.discardUncommittedChanges();
    this.completeOnMouseUp = false;

    this.push(new PickSnapTargetsInteraction()).then(result =>
    {
      this.#snapTargets = result ?? [];
      this.#snapTargetContainer.clear();
      for (const p of this.#snapTargets)
        this.#snapTargetContainer.addMarker(p);

      this.#mousePosition = this.#playfield.toLocalSpace(this.getContainingInputManager()!.currentState.mouse.position);
      this.#inputString = "";

      this.invalidateState();
    });
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
      this.#snapTargetContainer = new SnapTargetContainer({ relativeSizeAxes: Axes.Both }),
      this.#statusBar = new ComposerStatusBar(),
      new HotkeyBar(this),
    ];

    if (this.#selection.size === 0)
      this.exit();
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.#mousePosition = this.#playfield.toLocalSpace(this.getContainingInputManager()!.currentState.mouse.position);

    this.#inputManager = this.getContainingInputManager()!;

    this.snapped.bindValueChanged(this.invalidateState, this);
    this.axis.bindValueChanged(this.invalidateState, this);
    this.negative.bindValueChanged(this.invalidateState, this);

    this.invalidateState();
  }

  protected override onKeyDown(e: KeyDownEvent): boolean
  {
    if (e.key.startsWith("Digit"))
    {
      const newValue = Number.parseInt(this.#inputString + e.key.substring("Digit".length));

      if (Number.isFinite(newValue))
      {
        this.#inputString = newValue.toString();
        this.invalidateState();
        return true;
      }
    }

    switch (e.key)
    {
    case Key.Period:
      if (!this.#inputString.includes("."))
        this.#inputString += ".";
      this.invalidateState();
      return true;
    }

    return super.onKeyDown(e);
  }

  @keyBindingHandler(PlatformAction.DeleteBackwardChar)
  private removeLastCharacter()
  {
    this.invalidateState();
  }

  protected override onMouseMove(e: MouseMoveEvent): boolean
  {
    const newPosition = this.#playfield.toLocalSpace(e.screenSpaceMousePosition);

    let delta = newPosition.sub(this.#mousePosition);

    this.#mousePosition = newPosition;

    if (this.preciseMode.value)
      delta = delta.scale(0.1);

    this.#mouseDelta = this.#mouseDelta.add(delta);

    this.invalidateState();

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

  private invalidateState()
  {
    this.#needsUpdate = true;
  }

  protected override update()
  {
    super.update();

    if (this.completeOnMouseUp && !this.#inputManager.currentState.mouse.isPressed(MouseButton.Left))
    {
      this.complete();
      return;
    }

    if (this.#needsUpdate)
    {
      this.#updateState();
      this.#needsUpdate = false;
    }
  }

  #updateState()
  {
    if (this.completed)
      return;

    this.history.discardUncommittedChanges();

    if (this.#selection.size === 0)
    {
      this.expire();
      return;
    }

    const bounds = OsuOperatorUtils.getBounds(this.#selection);

    let delta = this.parseInputString() ?? this.getMouseDelta();

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

      let closestDistance = Number.MAX_VALUE;
      let closestOffset = Vec2.zero();

      let snapTargets = this.#snapTargets;
      if (snapTargets.length === 0)
        snapTargets = [...this.#selection].flatMap(it => it.getSnapTargets());

      snapTargets = snapTargets.map(p => p.add(delta));

      for (const dho of this.#playfield.hitObjectContainer.aliveObjects)
      {
        const hitObject = dho.hitObject as OsuHitObject;

        if (this.#selection.has(hitObject))
          continue;

        for (const ownTarget of snapTargets)
        {
          for (const target of hitObject.getSnapTargets())
          {
            const distance = target.distance(ownTarget);

            if (distance < closestDistance)
            {
              closestDistance = distance;
              closestOffset = target.sub(ownTarget);
            }
          }
        }
      }

      if (closestDistance < 5)
      {
        delta = delta.add(closestOffset);
      }
    }


    const clamped = OsuOperatorUtils.restrictMovement([...this.#selection], delta);
    const didClamp = !delta.equals(clamped);

    delta = clamped;

    if (this.#inputString.length > 0 && this.axis.value !== null)
    {
      this.#statusBar.text = `[${this.negative.value ? "-" : ""}${this.#inputString}|] = ${this.#formatNumber(delta[this.axis.value])}px along ${this.axis.value.toUpperCase()} axis${didClamp ? " (clamped)" : ""}`;
    }
    else
    {
      if (this.axis.value !== null)
        this.#statusBar.text = `${this.#formatNumber(delta[this.axis.value])}px along ${this.axis.value.toUpperCase()} axis${didClamp ? " (clamped)" : ""}`;
      else
        this.#statusBar.text = `Dx: ${this.#formatNumber(delta.x)}px Dy: ${this.#formatNumber(delta.y)}px (${this.#formatNumber(delta.length())}px)${didClamp ? " (clamped)" : ""}`;
    }

    this.#snapTargetContainer.offset = delta;

    for (const h of this.#selection)
      h.moveBy(delta);

    this.#lastDelta = delta;
  }

  #formatNumber(value: number)
  {
    return value.toFixed(1);
  }

  protected override onComplete()
  {
    this.history.discardUncommittedChanges();

    this.#composer.beginOperator(MoveOperator, [...this.#selection], this.#lastDelta);
  }
}
