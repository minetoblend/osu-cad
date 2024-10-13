import type {
  Drawable,
  MouseDownEvent,
  MouseUpEvent,
} from 'osucad-framework';
import {
  BindableBoolean,
  CompositeDrawable,
  CursorContainer,
  dependencyLoader,
  DrawableSprite,
  EasingFunction,
  MouseButton,
  resolved,
  Vec2,
} from 'osucad-framework';
import cursorTexture from './assets/icons/select.png';
import { OsucadConfigManager } from './config/OsucadConfigManager';
import { OsucadSettings } from './config/OsucadSettings';
import { getIcon } from './OsucadIcons';

export class MainCursorContainer extends CursorContainer {
  createCursor(): Drawable {
    return new Cursor();
  }

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  isVisible = new BindableBoolean(true);

  useNativeCursor = new BindableBoolean(true);

  @dependencyLoader()
  load() {
    this.config.bindWith(OsucadSettings.NativeCursor, this.useNativeCursor);

    this.useNativeCursor.addOnChangeListener(e => this.updateCursor());
    this.isVisible.addOnChangeListener(e => this.updateCursor());

    this.updateCursor();
  }

  updateCursor() {
    const isVisible = this.isVisible.value && !this.useNativeCursor.value;

    if (isVisible)
      this.show();
    else
      this.hide();

    if (this.useNativeCursor.value)
      document.body.style.cursor = `url('${cursorTexture}') 4 2, auto`;
    else
      document.body.style.cursor = 'none';
  }
}

class Cursor extends CompositeDrawable {
  #shadow!: DrawableSprite;
  #sprite!: DrawableSprite;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      (this.#shadow = new DrawableSprite({
        texture: getIcon('select'),
        x: -4,
        y: -1,
        color: 0x000000,
        alpha: 0.2,
      })),
      (this.#sprite = new DrawableSprite({
        texture: getIcon('select'),
        x: -4,
        y: -3,
      })),
    );
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#sprite.scaleTo(0.8, 1000, EasingFunction.OutQuart);
      this.#sprite.moveTo(new Vec2(-5, -4), 1000, EasingFunction.OutQuart);

      this.#shadow.scaleTo(0.8, 1000, EasingFunction.OutQuart);
      this.#shadow.moveTo(new Vec2(-5, -2), 1000, EasingFunction.OutQuart);
    }
    return false;
  }

  onMouseUp(e: MouseUpEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#sprite.scaleTo(1, 200, EasingFunction.OutBack);
      this.#sprite.moveTo(new Vec2(-4, -3), 200, EasingFunction.OutBack);

      this.#shadow.scaleTo(1, 200, EasingFunction.OutBack);
      this.#shadow.moveTo(new Vec2(-4, -1), 200, EasingFunction.OutBack);
    }
    return false;
  }
}
