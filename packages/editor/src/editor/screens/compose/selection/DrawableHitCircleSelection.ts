import type { HitCircle } from '../../../../beatmap/hitObjects/HitCircle';
import { Anchor, Axes, dependencyLoader, DrawableSprite, resolved } from 'osucad-framework';
import { OsuHitObject } from '../../../../beatmap/hitObjects/OsuHitObject';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { DrawableSelection } from './DrawableSelection';

export class DrawableHitCircleSelection extends DrawableSelection<HitCircle> {
  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  @dependencyLoader()
  load() {
    this.size = OsuHitObject.object_dimensions;
    this.origin = Anchor.Center;

    this.addInternal(new DrawableSprite({
      texture: this.skin.getTexture('hitcircleselect'),
      relativeSizeAxes: Axes.Both,
    }));

    this.positionBindable.addOnChangeListener(() => this.scheduler.addOnce(this.updatePosition, this));
    this.stackHeightBindable.addOnChangeListener(() => this.scheduler.addOnce(this.updatePosition, this));
    this.scaleBindable.addOnChangeListener(scale => this.scale = scale.value);
  }

  protected updatePosition() {
    this.position = this.hitObject.stackedPosition;
  }
}
