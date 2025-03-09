import type { Drawable, MouseDownEvent, MouseUpEvent } from '@osucad/framework';
import { CompositeDrawable, CursorContainer, DrawableSprite, EasingFunction, MouseButton, Vec2 } from '@osucad/framework';
import { getIcon } from '@osucad/resources';

export class DefaultCursorContainer extends CursorContainer {
  override createCursor(): Drawable {
    return new DefaultCursor();
  }
}

export class DefaultCursor extends CompositeDrawable {
  constructor() {
    super();

    this.scale = 0.35;

    const texture = getIcon('diamond-sword');
    texture.source.magFilter = 'nearest';
    texture.source.minFilter = 'nearest';
    texture.source.mipmapFilter = 'nearest';
    texture.source.update();

    this.addAllInternal(
      this.#shadow = new DrawableSprite({
        texture,
        x: -4,
        y: -1,
        color: 0x000000,
        alpha: 0.2,
      }),
      this.#sprite = new DrawableSprite({
        texture,
        x: -5,
        y: -4,
      }),
    );
  }

  #shadow!: DrawableSprite;

  #sprite!: DrawableSprite;

  protected get sprite() {
    return this.#sprite;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left)
      this.animateMouseDown();

    return false;
  }

  override onMouseUp(e: MouseUpEvent) {
    this.animateMouseUp();
  }

  animateMouseDown() {
    this.#sprite.scaleTo(0.8, 1000, EasingFunction.OutQuart);
    this.#sprite.moveTo(new Vec2(-5, -4), 1000, EasingFunction.OutQuart);

    this.#shadow.scaleTo(0.8, 1000, EasingFunction.OutQuart);
    this.#shadow.moveTo(new Vec2(-5, -2), 1000, EasingFunction.OutQuart);
  }

  animateMouseUp() {
    this.#sprite.scaleTo(1, 200, EasingFunction.OutBack);
    this.#sprite.moveTo(new Vec2(-4, -3), 200, EasingFunction.OutBack);

    this.#shadow.scaleTo(1, 200, EasingFunction.OutBack);
    this.#shadow.moveTo(new Vec2(-4, -1), 200, EasingFunction.OutBack);
  }
}
