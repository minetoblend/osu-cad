import { ISkinSource } from "@osucad/core";
import type { Drawable, ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Container, CursorContainer, DrawableSprite, resolved } from "@osucad/framework";

export class OsuCursorContainer extends CursorContainer
{
  override createCursor(): Drawable
  {
    return new OsuCursor();
  }

  @resolved(ISkinSource)
  skin!: ISkinSource;

  override update()
  {
    super.update();

    const texture = this.skin.getTexture("cursortrail");
    if (texture)
    {
      const sprite = new DrawableSprite({
        origin: Anchor.Center,
        depth: 1,
        texture,
        alpha: 0.35,
        scale: 0.5,
        position: this.activeCursor.position,
      });
      this.addInternal(sprite);
      sprite.fadeOut(1000).expire();
    }
  }
}

export class OsuCursor extends Container
{
  @resolved(ISkinSource)
  skin!: ISkinSource;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.addInternal(new DrawableSprite({
      origin: Anchor.Center,
      texture: this.skin.getTexture("cursor"),
    }));
  }
}
