import type { HitSoundsScreen } from './HitSoundsScreen';
import { Vec2 } from 'osucad-framework';

export class HitSoundsScreenLayout {
  constructor(
    readonly screen: HitSoundsScreen,
  ) {
  }

  get playfieldSize(): Vec2 {
    const screenSize = this.screen.childSize;

    const height = screenSize.y * 0.4;

    const width = Math.max(height * 4 / 3, screenSize.x * 0.3);

    return new Vec2(width, height);
  }

  get topContainerSize(): Vec2 {
    const screenSize = this.screen.childSize;

    const playfieldSize = this.playfieldSize;

    return new Vec2(screenSize.x - playfieldSize.x, playfieldSize.y);
  }
}
