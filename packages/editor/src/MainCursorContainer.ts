import gsap from 'gsap';
import type {
  Drawable,
  MouseDownEvent,
  MouseUpEvent,
} from 'osucad-framework';
import {
  CompositeDrawable,
  CursorContainer,
  DrawableSprite,
  MouseButton,
  dependencyLoader,
} from 'osucad-framework';

export class MainCursorContainer extends CursorContainer {
  createCursor(): Drawable {
    return new Cursor();
  }
}

class Cursor extends CompositeDrawable {
  #shadow!: DrawableSprite;
  #sprite!: DrawableSprite;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      (this.#shadow = new DrawableSprite({
        texture: useAsset('icon:select'),
        x: -4,
        y: -1,
        color: 0x000000,
        alpha: 0.2,
      })),
      (this.#sprite = new DrawableSprite({
        texture: useAsset('icon:select'),
        x: -4,
        y: -3,
      })),
    );
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      gsap.killTweensOf(this.#sprite);
      gsap.to(this.#sprite, {
        scaleX: 0.8,
        scaleY: 0.8,
        x: -5,
        y: -4,
        duration: 1.0,
        ease: 'power4.out',
      });

      gsap.killTweensOf(this.#shadow);
      gsap.to(this.#shadow, {
        scaleX: 0.8,
        scaleY: 0.8,
        x: -5,
        y: -2,
        duration: 1.0,
        ease: 'power4.out',
      });
    }
    return false;
  }

  onMouseUp(e: MouseUpEvent): boolean {
    if (e.button === MouseButton.Left) {
      gsap.killTweensOf(this.#sprite);
      gsap.to(this.#sprite, {
        scaleX: 1,
        scaleY: 1,
        x: -4,
        y: -3,
        duration: 0.2,
        ease: 'back.out',
      });

      gsap.killTweensOf(this.#shadow);
      gsap.to(this.#shadow, {
        scaleX: 1,
        scaleY: 1,
        x: -4,
        y: -1,
        duration: 0.2,
        ease: 'back.out',
      });
    }
    return false;
  }
}
