import type { Bindable } from 'osucad-framework';
import type { Color } from 'pixi.js';
import { dependencyLoader, DrawableSprite, resolved, Vec2 } from 'osucad-framework';
import { DrawableHitObject } from '../../../../hitObjects/drawables/DrawableHitObject';
import { ISkinSource } from '../../../../skinning/ISkinSource';

export class StableApproachCircle extends DrawableSprite {
  constructor() {
    super({
      // relativeSizeAxes: Axes.Both,
    });
  }

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  private accentColor!: Bindable<Color>;

  @resolved(DrawableHitObject)
  private drawableHitObject!: DrawableHitObject;

  @dependencyLoader()
  load() {
    const texture = this.skin.getTexture('approachcircle');
    if (texture) {
      this.texture = texture;
      this.size = new Vec2(texture.width, texture.height);
    }
  }

  protected override loadComplete() {
    super.loadComplete();

    this.accentColor = this.drawableHitObject.accentColor.getBoundCopy();
    this.accentColor.addOnChangeListener(color => this.color = color.value, { immediate: true });
  }
}
