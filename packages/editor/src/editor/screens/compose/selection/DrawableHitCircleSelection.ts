import type { HitCircle } from '@osucad/common';
import { ISkinSource, OsuHitObject, OsuSkinComponentLookup, SkinnableDrawable } from '@osucad/common';
import { Anchor, Axes, dependencyLoader, resolved } from 'osucad-framework';
import { DrawableSelection } from './DrawableSelection';

export class DrawableHitCircleSelection extends DrawableSelection<HitCircle> {
  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  @dependencyLoader()
  load() {
    this.size = OsuHitObject.object_dimensions;
    this.origin = Anchor.Center;

    this.addInternal(
      new SkinnableDrawable(OsuSkinComponentLookup.HitCircleSelect).with({
        relativeSizeAxes: Axes.Both,
      }),
    );

    this.positionBindable.addOnChangeListener(() => this.scheduler.addOnce(this.updatePosition, this));
    this.stackHeightBindable.addOnChangeListener(() => this.scheduler.addOnce(this.updatePosition, this));
    this.scaleBindable.addOnChangeListener(scale => this.scale = scale.value);
  }

  protected updatePosition() {
    this.position = this.hitObject.stackedPosition;
  }
}
