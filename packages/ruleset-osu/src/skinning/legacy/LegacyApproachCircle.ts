import { ISkinSource } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, CompositeDrawable, DrawableSprite, resolved } from "@osucad/framework";

export class LegacyApproachCircle extends CompositeDrawable
{
  constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
  }

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.addInternal(
        new DrawableSprite({
          texture: this.skin.getTexture("approachcircle"),
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
    );
  }
}
