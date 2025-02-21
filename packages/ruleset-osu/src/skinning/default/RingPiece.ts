import { Ring } from '@osucad/core';
import { Anchor, Axes, CompositeDrawable } from '@osucad/framework';
import { OsuHitObject } from '@osucad/ruleset-osu';

export class RingPiece extends CompositeDrawable {
  constructor(thickness: number = 9) {
    super();

    this.size = OsuHitObject.object_dimensions;

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.addInternal(new Ring({
      relativeSizeAxes: Axes.Both,
      strokeWidth: thickness,
      strokeAlignment: 0,
    }));
  }
}
