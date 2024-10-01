import { Axes, Box } from 'osucad-framework';

export class HitSoundTimelineTick extends Box {
  constructor() {
    super({
      width: 1,
      relativeSizeAxes: Axes.Y,
      alpha: 0.15,
      color: 0x000000,
    });
  }
}
