import { DrawableRuleset, Playfield } from "@osucad/core";
import type { InputManager, MouseButton } from "@osucad/framework";
import { Anchor, Axes, dependencyLoader, resolved } from "@osucad/framework";
import { EditorBeatmap, EditorHistory } from "../../runtime";
import { EditorClock } from "../../EditorClock";
import { BindableBeatDivisor } from "../../BindableBeatDivisor";
import { ComposeToolContainer } from "./ComposeToolContainer";
import { HotkeyContainer } from "../../hotkeys/HotkeyContainer";
import type { ModalComposeTool } from "./ModalComposeTool";
import type { ComposeToolInfo } from "./ComposeToolInfo";
import { HotkeyBar } from "../../hotkeys/HotkeyBar";

export abstract class ComposeTool extends HotkeyContainer
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

    this.addInternal(new HotkeyBar(this).with({
      anchor: Anchor.BottomLeft,
      origin: Anchor.BottomLeft,
    }));
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
  protected accessor toolContainer!: ComposeToolContainer

  public override get removeWhenNotAlive(): boolean
  {
    return false;
  }

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

  public getPresence(): unknown
  {
    return null;
  }

  public recreate()
  {
    this.toolContainer.refresh();
  }

  public onEntering(previous?: ComposeTool)
  {
  }

  public onExiting(next?: ComposeTool)
  {
  }

  public onSuspending(next: ComposeTool)
  {
  }

  public onResuming(previous: ComposeTool)
  {
  }

  protected push<T>(modal: ModalComposeTool<T>): Promise<T | undefined>
  {
    return new Promise<T | undefined>((resolve) =>
    {
      modal.onComplete.once(resolve);

      this.toolContainer.push(modal);
    });
  }

  declare private static _info: ComposeToolInfo;

  public static get info(): ComposeToolInfo
  {
    if (!this._info)
      throw new Error("ComposeTool must be decorated with ComposeTool.metadata");

    return this._info;
  }

  public static get id()
  {
    return this.info.id;
  }

  public static get label()
  {
    return this.info.label;
  }

  public static get icon()
  {
    return this.info.icon;
  }

  public static get presenceOverlay()
  {
    return this.info.presenceOverlay;
  }
}

export type ComposeToolClass = (new () => ComposeTool) & ComposeToolInfo;

export namespace ComposeTool
{


  export function metadata<T extends ComposeTool>(toolInfo: ComposeToolInfo)
  {
    return (
      target: new () => T,
    ) =>
    {
      (target as { _info?: ComposeToolInfo })._info = toolInfo;
    };
  }

}
