import type { KeyDownEvent, ScrollEvent } from 'osucad-framework';
import { Key, Vec2 } from 'osucad-framework';
import { DrawableSliderShapeTool } from './DrawableSliderShapeTool';
import { WaveSliderShape } from './sliderShapes/WaveSliderShape';

export class DrawableWaveSliderTool extends DrawableSliderShapeTool<WaveSliderShape> {
  constructor() {
    super();
  }

  createSliderShape(): WaveSliderShape {
    return new WaveSliderShape(this.mousePosition);
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
