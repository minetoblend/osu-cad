import { DrawableHitObject, ISkinSource } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Bindable, CompositeDrawable, DrawableSprite, resolved } from "@osucad/framework";
import { Color } from "pixi.js";

export class LegacyApproachCircle extends CompositeDrawable
{
  @resolved(DrawableHitObject)
  hitObject!: DrawableHitObject;

  constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
  }

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  readonly accentColor = new Bindable(new Color(0xffffff));

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

  protected override loadComplete()
  {
    super.loadComplete();

    this.accentColor.bindTo(this.hitObject.accentColor);
    this.accentColor.bindValueChanged(color => this.color = color.value, true);
  }
}
