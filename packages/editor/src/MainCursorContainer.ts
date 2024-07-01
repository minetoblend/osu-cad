import {
  ClickEvent,
  CompositeDrawable,
  CursorContainer,
  Drawable,
  DrawableSprite,
  InputManager,
  MouseButton,
  MouseDownEvent,
  MouseUpEvent,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Texture } from 'pixi.js';
import { UIIcons } from './editor/UIIcons';
import gsap from 'gsap';

export class MainCursorContainer extends CursorContainer {
  createCursor(): Drawable {
    return new Cursor();
  }
}

class Cursor extends CompositeDrawable {
  @resolved(UIIcons)
  icons!: UIIcons;

  #sprite!: DrawableSprite;

  @dependencyLoader()
  load() {
    this.addInternal(
      (this.#sprite = new DrawableSprite({
        texture: this.icons.select,
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
    }
    return false;
  }
}
