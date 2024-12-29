import type { HitCircle } from '../../hitObjects/HitCircle';
import { Anchor, Axes, type ReadonlyDependencyContainer } from 'osucad-framework';
import { SkinnableDrawable } from '../../../../skinning/SkinnableDrawable';
import { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { OsuSkinComponentLookup } from '../../skinning/stable/OsuSkinComponentLookup';
import { OsuSelectionBlueprint } from './OsuSelectionBlueprint';

export class HitCircleSelectionBlueprint extends OsuSelectionBlueprint<HitCircle> {
  constructor() {
    super();
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

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
    this.position = this.hitObject!.stackedPosition;
  }
}
