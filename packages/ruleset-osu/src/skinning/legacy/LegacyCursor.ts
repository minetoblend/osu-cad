import type { ISkin } from "@osucad/core";
import { SkinnableCursor } from "../../ui/SkinnableCursor";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Container, DrawableSprite, EasingFunction, Vec2 } from "@osucad/framework";

const pressed_scale = 1.3;
const released_scale = 1;

export class LegacyCursor extends SkinnableCursor
{
  public static readonly REVOLUTION_DURATION = 10000;

  readonly #skin: ISkin;
  #spin = false;

  constructor(skin: ISkin)
  {
    super();

    this.#skin = skin;
    this.size = new Vec2(50);

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    const center = this.#skin.getConfig("cursorCentre") ?? true;
    this.#spin = this.#skin.getConfig("cursorRotate") ?? true;

    this.internalChildren = [
      this.expandTarget = new Container({
        autoSizeAxes: Axes.Both,
        origin: center ? Anchor.Center : Anchor.TopLeft,
        anchor: Anchor.Center,
        child: new DrawableSprite({
          texture: this.#skin.getTexture("cursor"),
          scale: 1 / 1.6,
        }),
      }),
      new Container({
        autoSizeAxes: Axes.Both,
        origin: center ? Anchor.Center : Anchor.TopLeft,
        anchor: Anchor.Center,
        child: new DrawableSprite({
          texture: this.#skin.getTexture("cursormiddle"),
          scale: 1 / 1.6,
        }),
      }),
    ];
  }

  override update()
  {
    super.update();

    if (this.#spin)
      this.expandTarget!.rotation += (this.time.elapsed / LegacyCursor.REVOLUTION_DURATION) * 2 * Math.PI;
  }

  override expand()
  {
    this.expandTarget?.scaleTo(released_scale)
      .scaleTo(pressed_scale, 100, EasingFunction.Out);
  }

  override contract()
  {
    this.expandTarget?.scaleTo(released_scale, 100, EasingFunction.Out);
  }

}
