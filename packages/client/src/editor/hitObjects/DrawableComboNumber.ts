import { ContainerDrawable } from '../../framework/drawable/ContainerDrawable.ts';
import { DrawableSprite } from '../../framework/drawable/DrawableSprite.ts';
import {
  dependencyLoader,
  resolved,
} from '../../framework/di/DependencyLoader.ts';
import { Skin } from '../skins/skin.ts';
import { Texture } from 'pixi.js';
import { Anchor } from '../../framework/drawable/Anchor.ts';
import { Vec2 } from '@osucad/common';

export class DrawableComboNumber extends ContainerDrawable {
  constructor(comboNumber: number) {
    super({
      anchor: Anchor.Centre,
    });
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
    this.removeAll();

    const digits: DrawableSprite[] = [];
    let number = this.#comboNumber + 1;

    while (number > 0) {
      const currentDigit = number % 10;
      number = Math.floor(number / 10);

      digits.unshift(
        new DrawableSprite({
          texture: this.skin.textures[
            `default${currentDigit}` as keyof Skin['textures']
          ] as Texture,
          scale: new Vec2(0.65),
          origin: Anchor.Centre,
          anchor: Anchor.Centre,
        }),
      );
    }
    this.addAll(digits);

    const totalWidth = digits.reduce((acc, digit) => acc + digit.drawSize.x, 0);
    let currentX = -totalWidth / 2;
    for (const child of digits) {
      child.x = currentX + child.drawSize.x / 2;
      currentX += child.drawSize.x;
    }
  }
}
