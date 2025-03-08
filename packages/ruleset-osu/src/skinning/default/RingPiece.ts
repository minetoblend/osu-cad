import { Anchor, Axes, Box, CircularContainer } from '@osucad/framework';
import { OsuHitObject } from '@osucad/ruleset-osu';

export class RingPiece extends CircularContainer {
  constructor(thickness: number = 9) {
    super();

    this.size = OsuHitObject.object_dimensions;

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.masking = true;
    this.borderThickness = thickness;
    this.borderColor = 0xFFFFFF;

    this.addInternal(new Box({
      relativeSizeAxes: Axes.Both,
      alpha: 0,
      alwaysPresent: true,
    }));
  }
}
