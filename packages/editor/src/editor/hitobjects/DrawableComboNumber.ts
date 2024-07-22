import {
  Anchor,
  CompositeDrawable,
  DrawableSprite,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Skin } from '../../skins/Skin';

export class DrawableComboNumber extends CompositeDrawable {
  constructor(comboNumber: number) {
    super();

    this.origin = Anchor.Center;
    this.#comboNumber = comboNumber;
  }

  #comboNumber: number;

  get comboNumber() {
    return this.#comboNumber;
  }

  set comboNumber(value) {
    if (value !== this.#comboNumber) {
      this.#comboNumber = value;
      this.generateObjects();
    }
  }

  @dependencyLoader()
  load() {
    this.generateObjects();
  }

  @resolved(Skin)
  skin!: Skin;

  generateObjects() {
    while (this.internalChildren.length > 0) {
      this.removeInternal(this.internalChildren[0]);
    }

    const digits: DrawableSprite[] = [];
    let number = this.#comboNumber + 1;

    while (number > 0) {
      const currentDigit = number % 10;
      number = Math.floor(number / 10);

      digits.unshift(
        new DrawableSprite({
          texture: this.skin.comboNumbers[currentDigit],
          scale: 0.65,
          origin: Anchor.Center,
          anchor: Anchor.Center,
        }),
      );
    }
    this.addAllInternal(...digits);

    const totalWidth = digits.reduce((acc, digit) => acc + digit.drawSize.x - 6, 0);
    let currentX = -totalWidth / 2;
    for (const child of digits) {
      child.x = currentX + (child.drawSize.x - 4) / 2;
      currentX += (child.drawSize.x - 4);
    }
  }
}
