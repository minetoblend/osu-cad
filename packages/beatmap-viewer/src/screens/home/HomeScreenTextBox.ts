import { OsucadColors, OsucadSpriteText, OsucadTextBox } from '@osucad/core';
import { Color } from 'pixi.js';

export class HomeScreenTextBox extends OsucadTextBox {
  constructor() {
    super();

    this.height = 40;
    this.fontSize = 20;

    this.commitOnFocusLost = false;
    this.releaseFocusOnCommit = false;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.backgroundUnfocused = this.backgroundFocused;
  }

  protected override get leftRightPadding(): number {
    return 14;
  }

  protected createPlaceholder(): OsucadSpriteText {
    return new OsucadSpriteText({
      text: 'Search for beatmap or enter beatmap id/url',
      color: new Color(OsucadColors.text).setAlpha(0.5),
      fontSize: 20,
    });
  }

  override get handleNonPositionalInput(): boolean {
    return true;
  }

  get requestsFocus(): boolean {
    return true;
  }
}
