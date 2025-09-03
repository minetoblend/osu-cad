import { Playfield } from "@osucad/core";
import { EditorColors, ModalInteraction } from "@osucad/editor";
import { Anchor, Axes, Box, Container, dependencyLoader, resolved, type Drawable, type InputManager, type Vec2 } from "@osucad/framework";
import { SliderPathHandle } from "../tools/slider/SliderPathVisualizer";
import type { OsuHitObject } from "../../hitObjects";

export class PickPointIneration extends ModalInteraction<Vec2>
{
  public override result: Vec2 | undefined = undefined;

  #inputManager!: InputManager;

  #cursor!: Drawable;

  @resolved(Playfield)
  accessor #playfield!: Playfield

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

    let closestDistance = Number.MAX_VALUE;
    let closestTarget: Vec2| undefined;

    for (const dho of this.#playfield.hitObjectContainer.aliveObjects)
    {
      for (const target of (dho.hitObject as OsuHitObject).getSnapTargets())
      {
        const distance = target.distance(mousePosition);
        if (distance < closestDistance)
        {
          closestDistance = distance;
          closestTarget = target;
        }
      }
    }

    for (const d of this.#inputManager.hoveredDrawables)
    {
      if (d instanceof SliderPathHandle)
      {
        const position = this.#playfield.toLocalSpace(d.screenSpaceDrawQuad.AABB.center);
        const distance = position.distance(mousePosition);

        if (distance < closestDistance)
        {
          closestDistance = distance;
          closestTarget = position;
        }
      }
    }

    if (closestDistance < 5)
    {
      return {
        position: closestTarget!,
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
