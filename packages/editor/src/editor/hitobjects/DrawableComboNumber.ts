import type { DrawableOsuHitObject } from './DrawableOsuHitObject';
import {
  Anchor,
  Bindable,
  CompositeDrawable,
  dependencyLoader,
  DrawableSprite,
  resolved,
} from 'osucad-framework';
import { ISkinSource } from '../../skinning/ISkinSource';
import { SkinConfig } from '../../skinning/SkinConfig.ts';
import { DrawableHitObject } from './DrawableHitObject';

export class DrawableComboNumber extends CompositeDrawable {
  constructor() {
    super();

    this.origin = Anchor.Center;
    this.anchor = Anchor.Center;
    this.scale = 0.7;
  }

  indexInComboBindable = new Bindable(0);

  @dependencyLoader()
  load() {
    this.indexInComboBindable.bindTo(this.parentHitObject!.indexInComboBindable);

    this.hitCircleOverlap = this.skin.getConfig(SkinConfig.HitCircleOverlap)?.value ?? -2;

    this.indexInComboBindable.addOnChangeListener(e => this.comboNumber = e.value + 1, { immediate: true });
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
  parentHitObject?: DrawableOsuHitObject;

  hitCircleOverlap = 0;

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
          origin: Anchor.Center,
          anchor: Anchor.Center,
        }),
      );
    }
    this.addAllInternal(...digits);

    // -2

    let totalWidth = digits.reduce((acc, digit) => acc + digit.drawWidth, 0);

    totalWidth -= (digits.length - 1) * this.hitCircleOverlap;

    let currentX = -totalWidth / 2;

    for (const child of digits) {
      child.x = currentX + child.drawWidth / 2;

      currentX += child.drawWidth - this.hitCircleOverlap;
    }
  }

  override dispose(isDisposing: boolean = true) {
    this.indexInComboBindable.unbindAll();

    super.dispose(isDisposing);
  }
}
