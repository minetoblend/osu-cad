import type { Drawable } from "@osucad/framework";
import { Anchor } from "@osucad/framework";
import { Box } from "@osucad/framework";
import { Axes, CompositeDrawable, FillDirection, FillFlowContainer, Vec2 } from "@osucad/framework";
import { Hotkeys } from "./Hotkeys";

export class HotkeyBar extends CompositeDrawable
{
  public constructor(target: Drawable)
  {
    super();

    this.height = 24;
    this.relativeSizeAxes = Axes.X;

    const children = Hotkeys.getHotkeys(target)
      .sort((a, b) => b.priority - a.priority)
      .filter(it => it.createDrawable)
      .map(it => it.createDrawable!.call(target));

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.75,
      }),
      new FillFlowContainer({
        relativeSizeAxes: Axes.Both,
        direction: FillDirection.Horizontal,
        spacing: new Vec2(10),
        padding: {
          horizontal: 20,
        },
        children: children.map(c => c.with({
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        })),
      }),
    ];
  }
}
