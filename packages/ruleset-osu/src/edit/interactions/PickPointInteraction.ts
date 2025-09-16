import { Playfield } from "@osucad/core";
import { EditorColors, Hotkeys, ModalComposeTool } from "@osucad/editor";
import { Anchor, Axes, Box, Container, dependencyLoader, type Drawable, type InputManager, resolved, type Vec2 } from "@osucad/framework";
import { SnapManager } from "../SnapManager";

export class PickPointInteraction extends ModalComposeTool<Vec2>
{
  public result: Vec2 | undefined = undefined;

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

  @Hotkeys.key("MouseLeftButton", { label: "Confirm" })
  @Hotkeys.key("Enter")
  #complete()
  {
    this.complete(this.result);
  }

  @Hotkeys.key("MouseRightButton", { label: "Cancel" })
  @Hotkeys.key("Escape")
  #cancel()
  {
    this.cancel();
  }
}
