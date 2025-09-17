import type { Drawable } from "@osucad/framework";
import { Anchor, Axes, CompositeDrawable, FillDirection, FillFlowContainer, Vec2 } from "@osucad/framework";
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

    this.internalChild = new FillFlowContainer({
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
    });
  }
}
