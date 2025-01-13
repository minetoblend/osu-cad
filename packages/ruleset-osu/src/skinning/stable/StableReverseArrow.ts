import type { Bindable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { Color } from 'pixi.js';
import type { DrawableSliderRepeat } from '../../hitObjects/drawables/DrawableSliderRepeat';
import { DrawableHitObject, ISkinSource } from '@osucad/common';
import { Anchor, Axes, CompositeDrawable, DrawableSprite, EasingFunction, resolved } from 'osucad-framework';

export class StableReverseArrow extends CompositeDrawable {
  @resolved(DrawableHitObject)
  private drawableRepeat!: DrawableSliderRepeat;

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  #arrow!: DrawableSprite;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.autoSizeAxes = Axes.Both;

    const texture = this.skin.getTexture('reversearrow');

    this.internalChild = this.#arrow = new DrawableSprite({
      texture,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    });

    this.drawableRepeat.applyCustomUpdateState.addListener(this.updateStateTransforms, this);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.accentColor = this.drawableRepeat.accentColor.getBoundCopy();

    this.accentColor.addOnChangeListener((c) => {
      this.#arrow.color = c.value.red + c.value.green + c.value.blue > (600 / 255) ? 0x000000 : 0xFFFFFF;
    }, { immediate: true });
  }

  private accentColor!: Bindable<Color>;

  override clearTransforms() {
  }

  override clearTransformsAfter() {
  }

  override applyTransformsAt() {
  }

  updateStateTransforms() {
    this.#arrow.applyTransformsAt(-Number.MAX_VALUE);
    this.#arrow.clearTransformsAfter(-Number.MAX_VALUE);

    const animDuration = Math.min(300, this.drawableRepeat.hitObject!.spanDuration);

    this.absoluteSequence(this.drawableRepeat.hitObject!.startTime, () => {
      this.#arrow.scaleTo(1).scaleTo(1.4, animDuration, EasingFunction.Out);
    });
  }
}
