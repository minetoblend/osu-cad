import { Playfield } from "@osucad/core";
import { EditorColors, HitObjectSelection, HotkeyBar, Interaction, ModalInteraction } from "@osucad/editor";
import type { Container, InputManager, MouseDownEvent, MouseMoveEvent } from "@osucad/framework";
import { Anchor, Axes, Box, CompositeDrawable, dependencyLoader, MouseButton, resolved, Vec2 } from "@osucad/framework";
import type { OsuHitObject } from "../../hitObjects";
import { SnapManager } from "../SnapManager";
import { SnapTargetContainer } from "./SnapTargetContainer";
import { SnapTargetMarker } from "./SnapTargetMarker";


export class PickSnapTargetsInteraction extends ModalInteraction<Vec2[]>
{
  public override result: Vec2[] = [];

  #cursor!: SnapTargetCursor;

  @resolved(HitObjectSelection)
  accessor #selection!: HitObjectSelection<OsuHitObject>

  @resolved(SnapManager)
  accessor #snapManager!: SnapManager

  @resolved(Playfield)
  accessor #playfield!: Playfield

  #mousePosition = Vec2.zero();
  #inputManager!: InputManager;
  #snapTargetContainer!: Container<SnapTargetMarker>;

  @dependencyLoader()
  #load()
  {
    this.internalChildren = [
      this.#cursor = new SnapTargetCursor(),
      this.#snapTargetContainer = new SnapTargetContainer({ relativeSizeAxes: Axes.Both }),
      new HotkeyBar(this),
    ];
  }

  @Interaction.invokeOnKey("A", "Add Snap Point")
  #addSnapTarget()
  {
    const position = this.snapTargetAtMousePosition.position;

    if (this.result.some(it => Vec2.almostEquals(position, it)))
      return;

    this.result.push(position);
    this.#snapTargetContainer.add(new SnapTargetMarker(position));
  }

  @Interaction.invokeOnKey("Alt+A", "Remove Last Snap Point")
  #removeLastSnapTarget()
  {
    const point = this.result.pop();

    if (point)
      this.#snapTargetContainer.children[this.#snapTargetContainer.children.length -1]?.expire();
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  protected override onMouseMove(e: MouseMoveEvent): boolean
  {
    this.#mousePosition = this.#playfield.toLocalSpace(e.screenSpaceMousePosition);

    return true;
  }

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    if (e.button === MouseButton.Left)
    {
      this.result.push(this.snapTargetAtMousePosition.position);
      this.complete();
      return true;
    }

    return super.onMouseDown(e) || true;
  }

  protected get snapTargetAtMousePosition()
  {
    const mousePosition = this.#mousePosition;

    const snapResult = this.#snapManager.getClosestSnapResult({
      points: [mousePosition],
      maxDistance: 5,
    });

    if (snapResult)
    {
      return {
        position: snapResult.position,
        snapped: true,
      };
    }

    return {
      position: mousePosition,
      snapped: false,
    };
  }

  @Interaction.invokeOnKey("B")
  #returnEmptyResult()
  {
    this.cancel();
  }

  protected override update(): void
  {
    super.update();

    const { position, snapped } = this.snapTargetAtMousePosition;

    this.#cursor.position = this.#playfield.toSpaceOfOtherDrawable(position, this);
    this.#cursor.shape = snapped ? "square" : "round";
  }
}

type CursorShape = "round" | "square";

class SnapTargetCursor extends CompositeDrawable
{
  public constructor()
  {
    super();

    this.size = new Vec2(18);
    this.masking = true;
    this.borderThickness = 3;
    this.borderColor = EditorColors.yellow;
    this.origin = Anchor.Center;


    this.internalChild = new Box({
      relativeSizeAxes: Axes.Both,
      alpha: 0,
      alwaysPresent: true,
    });
  }

  #shape!: CursorShape;

  public set shape(value: CursorShape)
  {
    if (this.#shape == value)
      return;

    this.#shape = value;

    switch(value)
    {
    case "round":
      this.cornerRadius = 9;
      break;
    case "square":
      this.cornerRadius = 0;
      break;
    }
  }
}
