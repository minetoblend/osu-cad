import type { KeyDownEvent } from '@osucad/framework';
import { OsucadColors, OsucadSpriteText, OsucadTextBox } from '@osucad/core';
import { Key } from '@osucad/framework';
import { Color } from 'pixi.js';

export class HomeScreenTextBox extends OsucadTextBox {
  constructor() {
    super();

    this.height = 40;
    this.fontSize = 20;

    this.commitOnFocusLost = false;
    this.releaseFocusOnCommit = false;
  }

  #handleLeftRightArrows = true;

  override get handleLeftRightArrows(): boolean {
    return this.#handleLeftRightArrows;
  }

  override set handleLeftRightArrows(value) {
    this.#handleLeftRightArrows = value;
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

  override onKeyDown(e: KeyDownEvent): boolean {
    if (!super.onKeyDown(e))
      return false;

    if ((e.key === Key.Enter || e.key === Key.NumpadEnter) && !e.repeat) {
      // SearchHero will block the enter key for us if the text has changed
      return false;
    }

    return true;
  }
}
