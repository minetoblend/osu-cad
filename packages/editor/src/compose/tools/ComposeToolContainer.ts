import { Axes, CompositeDrawable, provideSelf, resolved } from "@osucad/framework";
import { ActiveToolBindable } from "./ActiveToolBindable";
import type { ComposeTool } from "./ComposeTool";

@provideSelf()
export class ComposeToolContainer extends CompositeDrawable
{
  @resolved(ActiveToolBindable)
  accessor #activeToolBindable!: ActiveToolBindable;

  #activeTool?: ComposeTool | undefined;

  public get activeTool()
  {
    return this.#activeTool;
  }

  public constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.#activeToolBindable.bindValueChanged(e =>
    {
      if (!e.value)
        return;

      this.internalChild = this.#activeTool = new e.value();
    }, true);
  }

  public refresh()
  {
    this.#activeToolBindable.triggerChange();
  }
}
