import type { DrawableSpinner } from "../../hitObjects/drawables/DrawableSpinner";
import { DrawableHitObject, ISkinSource } from "@osucad/core";
import { Anchor, Axes, CompositeDrawable, Container, DrawableSprite, type ReadonlyDependencyContainer, resolved, Vec2 } from "@osucad/framework";
import { Color } from "pixi.js";

export class StableSpinnerBody extends CompositeDrawable
{
  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  @resolved(DrawableHitObject)
  protected spinner!: DrawableSpinner;

  #discBottom!: DrawableSprite;
  #discTop!: DrawableSprite;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    const glowColor = new Color("rgb(3, 151, 255)");

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.size = new Vec2(640, 480);
    this.position = new Vec2(0, -8);

    this.addInternal(new Container({
      scale: new Vec2(0.625),
      anchor: Anchor.Center,
      origin: Anchor.Center,
      relativeSizeAxes: Axes.Both,
      children: [
        new DrawableSprite({
          anchor: Anchor.Center,
          origin: Anchor.Center,
          texture: this.skin.getTexture("spinner-glow"),
          blendMode: "add",
          color: glowColor,
          alpha: 0.5,
        }),
        this.#discBottom = new DrawableSprite({
          anchor: Anchor.Center,
          origin: Anchor.Center,
          texture: this.skin.getTexture("spinner-bottom"),
        }),
        this.#discTop = new DrawableSprite({
          anchor: Anchor.Center,
          origin: Anchor.Center,
          texture: this.skin.getTexture("spinner-top"),
        }),
        new DrawableSprite({
          anchor: Anchor.Center,
          origin: Anchor.Center,
          texture: this.skin.getTexture("spinner-middle"),
        }),
        new DrawableSprite({
          anchor: Anchor.Center,
          origin: Anchor.Center,
          texture: this.skin.getTexture("spinner-middle2"),
          blendMode: "add",
        }),
      ],
    }));
  }

  override update()
  {
    super.update();
    if (this.spinner)
    {
      this.#discTop.rotation = this.spinner.spin;
      this.#discBottom.rotation = this.spinner.spin * 0.25;
    }
  }
}
