import { Playfield } from "@osucad/core";
import type { ComposeTool, HotkeyKeyEvent } from "@osucad/editor";
import { ComposerStatusBar, HitObjectComposer, HitObjectSelection, Hotkeys, ModalComposeTool } from "@osucad/editor";
import type { InputManager, KeyDownEvent, MouseMoveEvent } from "@osucad/framework";
import { Anchor, Axes, Bindable, BindableBoolean, Box, dependencyLoader, InputKey, Key, MouseButton, PlatformAction, resolved, Vec2 } from "@osucad/framework";
import type { OsuHitObject } from "../../hitObjects";
import { MoveOperator } from "../operators/MoveOperator";
import { OsuOperatorUtils } from "../operators/OsuOperatorUtils";
import { PickSnapTargetsInteraction } from "./PickSnapTargetsInteraction";
import { SnapTargetContainer } from "./SnapTargetContainer";
import type { SnapResultQuery } from "../SnapManager";
import { SnapManager } from "../SnapManager";
import { SnapTargetVisualizer } from "../SnapTargetVisualizer";

export interface MoveInteractionOptions
{
  completeOnMouseUp?: boolean
}

export class MoveInteraction extends ModalComposeTool
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
  #snapTargetVisualizer!: SnapTargetVisualizer;
  #snapTargets: Vec2[] = [];

  #inputManager!: InputManager;

  @resolved(HitObjectSelection)
  accessor #selection!: HitObjectSelection<OsuHitObject>;

  @resolved(SnapManager)
  accessor #snapManager!: SnapManager

  @resolved(Playfield)
  accessor #playfield!: Playfield;

  @resolved(HitObjectComposer)
  accessor #composer!: HitObjectComposer;

  @Hotkeys.toggle.keyDown("Minus")
  @Hotkeys.toggle.keyDown("KeypadMinus")
  private readonly negative = new BindableBoolean(false);

  @Hotkeys.toggle.key("Shift", { label: "Show Snap Targets" })
  private readonly showSnapTargets = new BindableBoolean(false);

  private readonly axis = new Bindable<"x" | "y" | null>(null);

  @Hotkeys.key("X")
  @Hotkeys.key("Y")
  #toggleAxis(event: HotkeyKeyEvent)
  {
    const axis = event.key === InputKey.X ? "x" : "y";

    this.axis.value = this.axis.value !== axis
        ? axis
        : null;
  }


  @Hotkeys.key("B", { label: "Pick Snap Target" })
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

      this.#mousePosition = this.#playfield.toLocalSpace(this.#inputManager.currentState.mouse.position);
      this.#inputString = "";

      this.invalidateState();
    });
  }

  @Hotkeys.toggle.keyDown("T", { label: "Grid snap" })
  @Hotkeys.toggle.key("Control", { label: "Invert grid snap" })
  private readonly snapped = new BindableBoolean(false);

  @Hotkeys.toggle.key("Shift", { label: "Precision mode" })
  private readonly preciseMode = new BindableBoolean(false);


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
      this.#snapTargetVisualizer = new SnapTargetVisualizer(),
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

    this.showSnapTargets.bindValueChanged(e =>
    {
      if (!e.value)
        this.#snapTargetVisualizer.clear();
      else
        this.invalidateState();
    });

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

  @Hotkeys.keyBinding(PlatformAction.DeleteBackwardChar)
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

    this.#updateState();

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
      this.complete();
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

      const snapQuery: SnapResultQuery = {
        ...(
            this.#snapTargets.length > 0
                ? { points: this.#snapTargets }
                : { hitObjects: this.#selection }
        ),
        offset: delta,
        maxDistance: 5,
        snapTo: {
          hitObjects: {
            exclude: this.#selection,
          },
        },
      };

      const snapResult = this.#snapManager.getClosestSnapResult(snapQuery);

      if (this.showSnapTargets.value)
      {
        this.#snapTargetVisualizer.updateContent(snapQuery);
      }

      if (snapResult)
        delta = delta.add(snapResult.offset);
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

  @Hotkeys.key("MouseLeftButton", { label: "Confirm", priority: Number.MAX_VALUE })
  @Hotkeys.key("Enter")
  #complete()
  {
    this.complete();
  }

  @Hotkeys.key("MouseRightButton", { label: "Cancel", priority: Number.MAX_VALUE })
  @Hotkeys.key("Escape")
  #cancel()
  {
    this.cancel();
  }

  public override onEntering(previous?: ComposeTool)
  {
    super.onEntering(previous);

    this.history.commit();
  }

  protected override onCompleted()
  {
    super.onCompleted();

    this.history.discardUncommittedChanges();

    this.#composer.beginOperator(MoveOperator, [...this.#selection], this.#lastDelta);
  }

  protected override onCanceled()
  {
    super.onCanceled();

    this.history.discardUncommittedChanges();
  }
}
