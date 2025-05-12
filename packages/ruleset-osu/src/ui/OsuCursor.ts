import { ISkinSource, PlayfieldClock } from "@osucad/core";
import type { Drawable, ReadonlyDependencyContainer } from "@osucad/framework";
import { computed, Vec2, watch, withEffectScope } from "@osucad/framework";
import { Anchor, Container, CursorContainer, DrawableSprite, resolved } from "@osucad/framework";

export class OsuCursorContainer extends CursorContainer
{
  override createCursor(): Drawable
  {
    return new OsuCursor();
  }

  @resolved(PlayfieldClock)
  protected playfieldClock!: PlayfieldClock;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.clock = this.playfieldClock;
  }

  @resolved(ISkinSource)
  skin!: ISkinSource;

  #lastPos?: Vec2;

  override update()
  {
    super.update();

    this.#lastPos ??= this.activeCursor.position;

    const currentPos = this.activeCursor.position;

    const distance = this.#lastPos!.distance(currentPos);

    const step = 10;

    if (distance < step)
      return;

    for (let d = step; d <= distance; d += step)
    {
      const pos = Vec2.lerp(this.#lastPos, currentPos, d / distance);

      this.addTrailParticleAt(pos);

      this.#lastPos = pos;
    }
  }

  addTrailParticleAt(position: Vec2)
  {
    const texture = this.skin.getTexture("cursortrail");
    if (texture)
    {
      const sprite = new DrawableSprite({
        origin: Anchor.Center,
        depth: 1,
        texture,
        alpha: 0.25,
        position: position,
      });
      this.addInternal(sprite);
      sprite.fadeOut(400).expire();
    }
  }
}

export class OsuCursor extends Container
{
  @resolved(ISkinSource)
  skin!: ISkinSource;

  #cursor!: DrawableSprite;

  #cursorRotate: boolean = true;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.addInternal(this.#cursor = new DrawableSprite({
      origin: Anchor.Center,
      texture: this.skin.getTexture("cursor"),
      rotation: 0,
    }));
  }

  @withEffectScope()
  protected override loadComplete(): void
  {
    super.loadComplete();

    watch(() => this.skin.getConfig("cursorRotate") ?? true, value => this.#cursorRotate = value);
  }

  override update()
  {
    super.update();

    if (this.#cursorRotate)
      this.#cursor.rotation += (this.time.elapsed / 10000) * (Math.PI * 2);
    else
      this.#cursor.rotation = 0;
  }
}
