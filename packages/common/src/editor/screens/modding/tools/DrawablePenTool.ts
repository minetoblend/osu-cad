import type { Drawable, MouseDownEvent, MouseMoveEvent, MouseUpEvent } from 'osucad-framework';
import { MouseButton } from 'osucad-framework';
import { StrokePoint } from '../../../../drawables/BrushStrokeGeometry';
import { ModPostDrawing } from '../objects/ModPostDrawing';
import { DrawableModdingTool } from './DrawableModdingTool';
import { ModdingColorPicker } from './ModdingColorPicker';

export class DrawablePenTool extends DrawableModdingTool {
  override createSettings(): Drawable {
    return new ModdingColorPicker();
  }

  #drawing: ModPostDrawing | null = null;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.modPost.add(this.#drawing = new ModPostDrawing());
      this.#drawing!.color = this.composer.activeColor.value;
      return true;
    }

    return false;
  }

  override onMouseMove(e: MouseMoveEvent): boolean {
    if (this.#drawing) {
      const pressure = e.pressure || 1;

      this.#drawing.path.push(new StrokePoint(this.playfieldMousePosition, pressure * 3));
      this.#drawing.updatePath();
    }
    return true;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (this.#drawing) {
      this.#drawing = null;
    }
  }
}
