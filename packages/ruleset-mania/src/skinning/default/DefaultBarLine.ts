import type { Bindable, Drawable, ReadonlyDependencyContainer, ValueChangedEvent } from 'osucad-framework';
import type { DrawableBarLine } from '../../objects/drawables/DrawableBarLine';
import { DrawableHitObject, SliderGradient } from '@osucad/common';
import { Anchor, Axes, Box, CompositeDrawable, DrawableSprite, resolved, Vec2 } from 'osucad-framework';

const gradient = new SliderGradient(0, 0, 1, 0);
gradient.addColorStop(0, 0xFFFFFF, 0);
gradient.addColorStop(1, 0xFFFFFF, 1);
gradient.buildLinearGradient();

export class DefaultBarLine extends CompositeDrawable {
  private major!: Bindable<boolean>;

  #mainLine!: Drawable;
  #leftAnchor!: Drawable;
  #rightAnchor!: Drawable;

  @resolved(DrawableHitObject)
  drawableHitObject!: DrawableHitObject;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.addInternal(this.#mainLine = new Box({
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.BottomCenter,
      origin: Anchor.BottomCenter,
    }));

    const major_extension = 30;

    this.addInternal(this.#leftAnchor = new DrawableSprite({
      blendMode: 'add',
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterRight,
      width: major_extension,
      relativeSizeAxes: Axes.Y,
      texture: gradient.texture,
      scale: new Vec2(-1, 1),
    }));

    this.addInternal(this.#rightAnchor = new DrawableSprite({
      blendMode: 'add',
      anchor: Anchor.CenterRight,
      origin: Anchor.CenterRight,
      width: major_extension,
      relativeSizeAxes: Axes.Y,
      texture: gradient.texture,
    }));

    this.major = (this.drawableHitObject as DrawableBarLine).major.getBoundCopy();
  }

  protected override loadComplete() {
    super.loadComplete();

    this.major.bindValueChanged(this.#updateMajor, this, true);
  }

  #updateMajor(major: ValueChangedEvent<boolean>) {
    this.#mainLine.alpha = major.value ? 0.5 : 0.2;
    this.#leftAnchor.alpha = this.#rightAnchor.alpha = major.value ? this.#mainLine.alpha * 0.3 : 0;
  }
}
