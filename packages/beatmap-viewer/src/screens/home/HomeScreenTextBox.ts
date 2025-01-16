import { OsucadColors, OsucadSpriteText, TextBox } from '@osucad/core';
import { isMobile, MarginPadding } from '@osucad/framework';
import { Color } from 'pixi.js';

export class HomeScreenTextBox extends TextBox {
  constructor() {
    super();

    this.height = 40;

    this.placeholderText = 'Search for beatmap or enter beatmap id/url';

    this.commitOnFocusLost = false;
  }

  protected get textContainerPadding(): MarginPadding {
    return new MarginPadding({ horizontal: 14, vertical: 10 });
  }

  protected createText(): OsucadSpriteText {
    return new OsucadSpriteText({
      color: OsucadColors.text,
      fontSize: 20,
    });
  }

  protected createPlaceholder(): OsucadSpriteText {
    return new OsucadSpriteText({
      text: this.placeholderText,
      color: new Color(OsucadColors.text).setAlpha(0.5),
      fontSize: 20,
    });
  }

  get requestsFocus(): boolean {
    return !isMobile.any;
  }
}
