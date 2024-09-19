import type {
  KeyDownEvent,
  ScrollEvent,
} from 'osucad-framework';
import { clamp, Key } from 'osucad-framework';

import { DrawableSliderShapeTool } from './DrawableSliderShapeTool';
import { BirdSliderShape } from './sliderShapes/BirdSliderShape';

export class DrawableBirdSliderTool extends DrawableSliderShapeTool<BirdSliderShape> {
  constructor() {
    super();
  }

  createSliderShape(): BirdSliderShape {
    return new BirdSliderShape(this.mousePosition);
  }

  onScroll(e: ScrollEvent): boolean {
    if (this.isPlacing && this.isPlacingEnd) {
      const multiplier = e.scrollDelta.y > 0 ? 1.1 : 1 / 1.1;

      this.shape.tailSize = clamp(this.shape.tailSize * multiplier, 0.1, 2);

      this.updatePath();

      return true;
    }

    return false;
  }

  onKeyDown(e: KeyDownEvent): boolean {
    switch (e.key) {
      case Key.KeyF:
        if (this.isPlacingEnd) {
          this.shape.flip();
          this.updatePath();
          return true;
        }
    }

    return false;
  }
}
