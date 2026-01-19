import type { ValueChangedEvent } from "@osucad/framework";
import { Cached } from "@osucad/framework";
import { Axes, CompositeDrawable, provideSelf, resolved } from "@osucad/framework";
import { ActiveToolBindable } from "./ActiveToolBindable";
import type { ComposeTool, ComposeToolClass } from "./ComposeTool";
import type { ModalComposeTool } from "./ModalComposeTool";
import { ComposeScreen } from "../ComposeScreen";
import { HotkeyBar } from "../../hotkeys/HotkeyBar";

@provideSelf()
export class ComposeToolContainer extends CompositeDrawable
{
  @resolved(ActiveToolBindable)
  accessor #activeToolBindable!: ActiveToolBindable;

  @resolved(() => ComposeScreen)
  accessor #composeScreen!: ComposeScreen;

  #activeTool?: ComposeTool | undefined;

  #tools: ComposeTool[] = [];

  readonly #statusBar = new Cached();

  public get activeTool()
  {
    return this.#activeTool;
  }

  public get activeSubTool(): ComposeTool | undefined
  {
    return this.#tools[this.#tools.length - 1];
  }

  public constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.#activeToolBindable.bindValueChanged(this.#onToolChanged, this, true);
  }

  protected override updateAfterChildren()
  {
    super.updateAfterChildren();

    for (let i = 0; i < this.#exited.length; i++)
    {
      if (!this.#exited[i].isAlive)
      {
        this.removeInternal(this.#exited[i]);
        this.#exited.splice(i--, 1);
      }
    }

    if (!this.#statusBar.isValid)
    {
      this.#statusBar.validate();

      this.#composeScreen.setStatusBarContent(
          this.activeSubTool
              ? new HotkeyBar(this.activeSubTool)
              : null,
      );
    }
  }

  #exited: ComposeTool[] = [];

  public push(tool: ModalComposeTool<any>)
  {
    this.#push(tool);
  }

  #push(tool: ComposeTool)
  {
    const parent = this.activeSubTool;

    if (parent)
    {
      parent.onSuspending(tool);

      if (!parent.keepVisible)
        parent.expire();
    }

    this.addInternal(tool);
    this.#tools.push(tool);

    tool.doWhenLoaded(() => tool.onEntering(tool));
    this.#statusBar.invalidate();
  }

  public pop()
  {
    const tool = this.#tools.pop();
    if (!tool)
      return false;

    const next = this.activeSubTool;

    tool.onExiting(next);
    tool.expire();

    this.#exited.push(tool);

    if (next)
    {
      next.onResuming(tool);
      next.lifetimeEnd = Number.POSITIVE_INFINITY;
    }

    this.#statusBar.invalidate();

    return true;
  }

  #exitAll()
  {
    while (this.#tools.length > 0)
      this.pop();
  }

  #onToolChanged(e: ValueChangedEvent<ComposeToolClass>)
  {
    if (!e.value)
      return;

    const tool = new e.value();

    this.#exitAll();

    this.#activeTool = tool;
    this.#push(tool);
  }

  public refresh()
  {
    this.#activeToolBindable.triggerChange();
  }
}
