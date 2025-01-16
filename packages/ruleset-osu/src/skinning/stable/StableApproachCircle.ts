import type { Bindable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { Color } from 'pixi.js';
import { DrawableHitObject, ISkinSource } from '@osucad/core';
import { Anchor, Axes, CompositeDrawable, DrawableSprite, resolved } from '@osucad/framework';

export class StableApproachCircle extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  private accentColor!: Bindable<Color>;

  @resolved(DrawableHitObject)
  private drawableHitObject!: DrawableHitObject;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const texture = this.skin.getTexture('approachcircle');
    if (texture) {
      this.addInternal(new DrawableSprite({
        texture,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }));
    }
  }

  protected override loadComplete() {
    super.loadComplete();

    this.accentColor = this.drawableHitObject.accentColor.getBoundCopy();
    this.accentColor.addOnChangeListener(color => this.color = color.value, { immediate: true });
  }
}
