import type { Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent, ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Box, CompositeDrawable, Container } from "@osucad/framework";
import { OsuAction } from "../ui/OsuAction";

export class KeyVisualizer extends CompositeDrawable implements IKeyBindingHandler<OsuAction>
{
  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.anchor = Anchor.BottomRight;
    this.origin = Anchor.BottomRight;

    this.width = 100;
    this.height = 200;
    this.masking = true;

    this.y = -60;
    this.x = -10;

    this.internalChildren = [
      this.leftContainer = new Container({
        relativeSizeAxes: Axes.Both,
        width: 0.5,
        padding: { right: 5 },
      }),
      this.rightContainer = new Container({
        relativeSizeAxes: Axes.Both,
        width: 0.5,
        padding: { left: 5 },
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
      }),
    ];
  }

  private leftContainer!: Container;
  private rightContainer!: Container;

  private leftBox?: Drawable;
  private rightBox?: Drawable;

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean
  {
    return binding instanceof OsuAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<OsuAction>): boolean
  {
    switch (e.pressed)
    {
    case OsuAction.LeftButton:
      this.leftContainer.add(
          this.leftBox = new Container({
            relativeSizeAxes: Axes.X,
            anchor: Anchor.BottomLeft,
            origin: Anchor.BottomLeft,
            masking: true,
            cornerRadius: 10,
            child: new Box({ relativeSizeAxes: Axes.Both }),
          }),
      );
      break;
    case OsuAction.RightButton:
      this.rightContainer.add(
          this.rightBox = new Container({
            relativeSizeAxes: Axes.X,
            anchor: Anchor.BottomLeft,
            origin: Anchor.BottomLeft,
            masking: true,
            cornerRadius: 10,
            child: new Box({ relativeSizeAxes: Axes.Both }),
          }),
      );
      break;
    }

    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<OsuAction>)
  {
    switch (e.pressed)
    {
    case OsuAction.LeftButton:
      this.leftBox = undefined;
      break;
    case OsuAction.RightButton:
      this.rightBox = undefined;
      break;
    }
  }

  override updateAfterChildren()
  {
    super.updateAfterChildren();

    if (this.leftBox)
      this.leftBox.height = Math.min(this.leftBox.height + this.time.elapsed * 0.5, this.drawHeight);
    if (this.rightBox)
      this.rightBox.height = Math.min(this.rightBox.height + this.time.elapsed * 0.5, this.drawHeight);

    for (const c of [...this.leftContainer.children, ...this.rightContainer.children] as Drawable[])
    {
      if (c === this.leftBox || c === this.rightBox)
        continue;

      c.y -= this.time.elapsed * 0.5;

      const topEdge = c.y + this.drawHeight - c.drawHeight;

      if (topEdge < 0)
        c.height += topEdge;

      if (c.height < 0)
        c.expire();
    }
  }
}
