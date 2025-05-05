import { IComboNumberReference, ISkinSource } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Bindable, CompositeDrawable, DrawableSprite, resolved } from "@osucad/framework";

export class LegacyComboNumber extends CompositeDrawable
{
  constructor()
  {
    super();

    this.origin = Anchor.Center;
    this.anchor = Anchor.Center;
    this.scale = 0.7;
  }

  indexInComboBindable = new Bindable(0);

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    if (this.referenceObject)
      this.indexInComboBindable.bindTo(this.referenceObject.indexInComboBindable);

    this.hitCircleOverlap = this.skin.getConfigValue("hitCircleOverlap") ?? -2;

    this.prefix = this.skin.getConfigValue("hitCirclePrefix") ?? "default";

    this.indexInComboBindable.addOnChangeListener(e => this.comboNumber = e.value + 1, { immediate: true });
  }

  prefix = "default";

  #comboNumber = 1;

  get comboNumber()
  {
    return this.#comboNumber;
  }

  set comboNumber(value: number)
  {
    this.#comboNumber = value;
    this.generateObjects();
  }

  @resolved(IComboNumberReference, true)
  referenceObject?: IComboNumberReference;

  hitCircleOverlap = 0;

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  generateObjects()
  {
    this.clearInternal();

    const digits: DrawableSprite[] = [];
    let number = this.#comboNumber;

    while (number > 0)
    {
      const currentDigit = number % 10;
      number = Math.floor(number / 10);

      digits.unshift(
          new DrawableSprite({
            texture: this.skin.getTexture(`${this.prefix}-${currentDigit}`),
            origin: Anchor.Center,
            anchor: Anchor.Center,
          }),
      );
    }

    this.addAllInternal(...digits);

    let totalWidth = digits.reduce((acc, digit) => acc + digit.drawWidth, 0);

    totalWidth -= (digits.length - 1) * this.hitCircleOverlap;

    let currentX = -totalWidth / 2;

    for (const child of digits)
    {
      child.x = currentX + child.drawWidth / 2;

      currentX += child.drawWidth - this.hitCircleOverlap;
    }
  }

  override dispose(isDisposing: boolean = true)
  {
    this.indexInComboBindable.unbindAll();

    super.dispose(isDisposing);
  }
}
