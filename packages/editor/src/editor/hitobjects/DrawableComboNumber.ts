import type { DrawableOsuHitObject } from './DrawableOsuHitObject';
import { Anchor, Bindable, CompositeDrawable, dependencyLoader, DrawableSprite, resolved } from 'osucad-framework';
import { ISkinSource } from '../../skinning/ISkinSource';
import { DrawableHitObject } from './DrawableHitObject';

export class DrawableComboNumber extends CompositeDrawable {
  constructor() {
    super();

    this.origin = Anchor.Center;
    this.anchor = Anchor.Center;
    this.drawNode.enableRenderGroup();
  }

  indexInComboBindable = new Bindable(0);

  @dependencyLoader()
  load() {
    this.indexInComboBindable.bindTo(this.parentHitObject!.indexInComboBindable);

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

  override dispose(isDisposing: boolean = true) {
    this.indexInComboBindable.unbindAll();

    super.dispose(isDisposing);
  }
}
