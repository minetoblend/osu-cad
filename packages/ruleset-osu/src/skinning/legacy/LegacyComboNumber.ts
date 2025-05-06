import { IComboNumberReference, ISkinSource } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Bindable, CompositeDrawable, DrawableSprite, resolved } from "@osucad/framework";
import { computed, watch, withEffectScope } from "@osucad/framework";

export class LegacyComboNumber extends CompositeDrawable
{
  constructor()
  {
    super();

    this.origin = Anchor.Center;
    this.anchor = Anchor.Center;
    this.scale = 0.8;
  }

  indexInComboBindable = new Bindable(0);

  hitCircleOverlap = computed(() => this.skin.getConfig("hitCircleOverlap") ?? -2);
  prefix = computed(() => this.skin.getConfig("hitCirclePrefix") ?? "default");

  @withEffectScope()
  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    if (this.referenceObject)
      this.indexInComboBindable.bindTo(this.referenceObject.indexInComboBindable);

    watch([this.hitCircleOverlap, this.prefix], () => this.generateObjects());

    this.indexInComboBindable.addOnChangeListener(e => this.comboNumber = e.value + 1, { immediate: true });
  }

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
            texture: this.skin.getTexture(`${this.prefix.value}-${currentDigit}`),
            origin: Anchor.Center,
            anchor: Anchor.Center,
          }),
      );
    }

    this.addAllInternal(...digits);

    let totalWidth = digits.reduce((acc, digit) => acc + digit.drawWidth, 0);

    totalWidth -= (digits.length - 1) * this.hitCircleOverlap.value;

    let currentX = -totalWidth / 2;

    for (const child of digits)
    {
      child.x = currentX + child.drawWidth / 2;

      currentX += child.drawWidth - this.hitCircleOverlap.value;
    }
  }

  override dispose(isDisposing: boolean = true)
  {
    this.indexInComboBindable.unbindAll();

    super.dispose(isDisposing);
  }
}
