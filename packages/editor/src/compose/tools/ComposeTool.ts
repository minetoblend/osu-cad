import type { HitObject } from "@osucad/core";
import { DrawableRuleset, Playfield } from "@osucad/core";
import type { InputManager, MouseButton } from "@osucad/framework";
import { Axes, CompositeDrawable, dependencyLoader, resolved } from "@osucad/framework";
import { EditorBeatmap, EditorHistory } from "../../runtime";
import { EditorClock } from "../../EditorClock";
import { BindableBeatDivisor } from "../../BindableBeatDivisor";
import { ComposeToolContainer } from "./ComposeToolContainer";

export abstract class ComposeTool<THitObject extends HitObject = HitObject> extends CompositeDrawable
{
  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.Both;
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.inputManager = this.getContainingInputManager()!;
  }

  protected inputManager!: InputManager;

  @resolved(EditorBeatmap)
  protected accessor beatmap!: EditorBeatmap

  @resolved(EditorClock)
  protected accessor editorClock!: EditorClock

  @resolved(BindableBeatDivisor)
  protected accessor beatDivisor!: BindableBeatDivisor

  @resolved(Playfield)
  protected accessor playfield!: Playfield

  @resolved(DrawableRuleset)
  protected accessor drawableRuleset!: DrawableRuleset

  @resolved(EditorHistory)
  protected accessor history!: EditorHistory

  @resolved(ComposeToolContainer)
  accessor #toolContainer!: ComposeToolContainer

  protected get screenSpaceMousePosition()
  {
    return this.inputManager.currentState.mouse.position;
  }

  protected get playfieldMousePosition()
  {
    return this.playfield.toLocalSpace(this.screenSpaceMousePosition);
  }

  protected get hitObjects()
  {
    return this.beatmap.hitObjects;
  }

  protected isMouseButtonPressed(button: MouseButton)
  {
    return this.inputManager.currentState.mouse.buttons.isPressed(button);
  }

  protected createPlayfieldAdjustmentContainer()
  {
    return this.drawableRuleset.createPlayfieldAdjustmentContainer();
  }

  getPresence(): unknown
  {
    return null;
  }

  recreate()
  {
    this.#toolContainer.refresh();
  }
}
