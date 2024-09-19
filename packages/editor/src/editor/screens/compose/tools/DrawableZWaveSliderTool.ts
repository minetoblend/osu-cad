import type {
  KeyDownEvent,
  ScrollEvent,
} from 'osucad-framework';
import {
  Key,
  Vec2,
} from 'osucad-framework';
import { DrawableSliderShapeTool } from './DrawableSliderShapeTool';
import { ZWaveSliderShape } from './sliderShapes/ZWaveSliderShape';

export class DrawableZWaveSliderTool extends DrawableSliderShapeTool<ZWaveSliderShape> {
  constructor() {
    super();
  }

  createSliderShape(): ZWaveSliderShape {
    return new ZWaveSliderShape(this.mousePosition);
  }

  onScroll(e: ScrollEvent): boolean {
    if (this.isPlacing && this.isPlacingEnd) {
      const multiplier = new Vec2(e.scrollDelta.y > 0 ? 1.1 : 1 / 1.1);

      if (e.shiftPressed) {
        multiplier.x = 1;
      }
      if (e.altPressed) {
        multiplier.y = 1;
      }

      this.shape.scaleBridgeAnchor(multiplier);

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
