import { Anchor, Axes, Box, CompositeDrawable, dependencyLoader, FillDirection, FillFlowContainer, Vec2 } from "@osucad/framework";
import type { Interaction } from "./Interaction";

export class HotkeyBar extends CompositeDrawable
{
  public constructor(public readonly interaction: Interaction)
  {
    super();

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;
    this.anchor = Anchor.BottomCenter;
    this.origin = Anchor.BottomCenter;
  }

  @dependencyLoader()
  #load()
  {
    let contentFlow: FillFlowContainer;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.5,
      }),
      contentFlow = new FillFlowContainer({
        direction: FillDirection.Horizontal,
        autoSizeAxes: Axes.Both,
        spacing: new Vec2(14),
        padding: 5,
      }),
    ];

    for (const hotkey of this.interaction.hotkeys)
    {
      const drawable = hotkey.createDrawable?.();

      if (drawable)
      {
        contentFlow.add(drawable.with({
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }));
      }
    }
  }
}
