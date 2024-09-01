import {
  Anchor,
  CompositeDrawable,
  DrawableSprite,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { ISkinSource } from '../../skinning/ISkinSource';
import { DrawableHitObject } from './DrawableHitObject';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';

export class DrawableComboNumber extends CompositeDrawable {
  constructor() {
    super();

    this.origin = Anchor.Center;
    this.anchor = Anchor.Center;
  }

  @dependencyLoader()
  load() {
    this.generateObjects();
  }

  #comboNumber = 1;

  get comboNumber() {
    return this.#comboNumber;
  }

  set comboNumber(value: number) {
    this.#comboNumber = value;
    this.generateObjects();
  }

  @resolved(DrawableHitObject, true)
  drawableHitObject?: DrawableHitObject;

  protected loadComplete() {
    super.loadComplete();

    if (this.drawableHitObject) {
      const hitObject = this.drawableHitObject;
      if (!(hitObject instanceof DrawableOsuHitObject))
        return;

      this.withScope(() => {
        hitObject.indexInComboBindable.addOnChangeListener(index => this.comboNumber = index.value + 1, { immediate: true });
      });
    }
  }

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  generateObjects() {
    while (this.internalChildren.length > 0) {
      this.removeInternal(this.internalChildren[0]);
    }

    const digits: DrawableSprite[] = [];
    let number = this.#comboNumber;

    while (number > 0) {
      const currentDigit = number % 10;
      number = Math.floor(number / 10);

      digits.unshift(
        new DrawableSprite({
          texture: this.skin.getTexture(`default-${currentDigit}`),
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
