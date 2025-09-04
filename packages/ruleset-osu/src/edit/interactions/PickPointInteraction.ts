import { Playfield } from "@osucad/core";
import { EditorColors, ModalInteraction } from "@osucad/editor";
import { Anchor, Axes, Box, Container, dependencyLoader, resolved, type Drawable, type InputManager, type Vec2 } from "@osucad/framework";
import { SnapManager } from "../SnapManager";

export class PickPointInteraction extends ModalInteraction<Vec2>
{
  public override result: Vec2 | undefined = undefined;

  #inputManager!: InputManager;

  #cursor!: Drawable;

  @resolved(Playfield)
  accessor #playfield!: Playfield

  @resolved(SnapManager)
  accessor #snapManager!: SnapManager

  @dependencyLoader()
  #load()
  {
    this.addInternal(this.#cursor = new Container({
      size: 14,
      origin: Anchor.Center,
      masking: true,
      borderThickness: 3,
      borderColor: EditorColors.yellow,
      child: new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
        alwaysPresent: true,
      }),
    }));
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  private get snapTargetAtMousePosition()
  {
    const mousePosition = this.#playfield.toLocalSpace(this.#inputManager.currentState.mouse.position);

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

  protected override update(): void
  {
    super.update();

    this.result = this.snapTargetAtMousePosition.position;

    this.#cursor.position = this.#playfield.toSpaceOfOtherDrawable(this.result, this);
  }
}
