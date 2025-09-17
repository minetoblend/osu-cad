import type { Drawable } from "@osucad/framework";
import { Axes, CompositeDrawable, resolved } from "@osucad/framework";
import { StatusBar } from "./StatusBar";

export abstract class EditorScreen extends CompositeDrawable
{
  protected constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(StatusBar)
  accessor #statusBar!: StatusBar;

  protected override loadComplete(): void
  {
    super.loadComplete();

    if (!this.#statusBarPopulated)
      this.setStatusBarContent(null);
  }

  #statusBarPopulated = false;

  public setStatusBarContent(content: Drawable | null)
  {
    this.#statusBarPopulated = true;

    this.#statusBar.clear();
    if (content)
      this.#statusBar.add(content);
  }
}
