import { Axes, CompositeDrawable, provideSelf, resolved } from "@osucad/framework";
import { ActiveToolBindable } from "./ActiveToolBindable";

@provideSelf()
export class ComposeToolContainer extends CompositeDrawable
{
  @resolved(ActiveToolBindable)
  accessor #activeTool!: ActiveToolBindable;

  constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.#activeTool.bindValueChanged(e =>
    {
      if (!e.value)
        return;

      this.internalChild = new e.value.tool();
    }, true);
  }

  refresh()
  {
    this.#activeTool.triggerChange();
  }
}
