import { Axes, CompositeDrawable } from "@osucad/framework";

export abstract class ComposeToolPresenceOverlay extends CompositeDrawable
{
  protected constructor()
  {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  abstract updatePresence(content: unknown): void;
}
