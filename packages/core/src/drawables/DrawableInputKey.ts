import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { Texture } from 'pixi.js';
import { Anchor, Axes, CompositeDrawable, DrawableSprite, EmptyDrawable, InputKey } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { OsucadColors } from '../OsucadColors';
import { OsucadSpriteText } from './OsucadSpriteText';

export class DrawableInputKey extends CompositeDrawable {
  constructor(readonly inputKey: InputKey) {
    super();

    this.autoSizeAxes = Axes.Both;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.internalChild = this.createContent();
  }

  protected createContent() {
    switch (this.inputKey) {
      case InputKey.MouseLeftButton:
        return this.createIcon(getIcon('mouse-left'));
      case InputKey.MouseMiddleButton:
        return this.createIcon(getIcon('mouse-middle'));
      case InputKey.MouseRightButton:
        return this.createIcon(getIcon('mouse-right'));
      case InputKey.Control:
        return this.createTextContent('Ctrl');
      case InputKey.Shift:
        return this.createTextContent('Shift');
      case InputKey.Alt:
        return this.createTextContent('Alt');
      case InputKey.Tab:
        return this.createTextContent('Tab');
    }

    if (this.inputKey >= InputKey.A && this.inputKey <= InputKey.Z) {
      const A = 'A'.charCodeAt(0);

      return this.createTextContent(String.fromCharCode(A + (this.inputKey - InputKey.A)));
    }

    return new EmptyDrawable();
  }

  protected createIcon(icon: Texture) {
    return new DrawableSprite({
      texture: icon,
      size: 14,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    });
  }

  protected createTextContent(text: string) {
    return new OsucadSpriteText({
      text,
      fontSize: 10,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      color: OsucadColors.text,
    });
  }
}
