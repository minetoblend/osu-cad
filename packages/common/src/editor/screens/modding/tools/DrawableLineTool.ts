import type { DragEndEvent, DragEvent, DragStartEvent, Drawable, MouseDownEvent } from 'osucad-framework';
import { Axes, FillDirection, FillFlowContainer, MouseButton, Vec2 } from 'osucad-framework';
import { ModPostLine } from '../objects/ModPostLine';
import { DrawableModdingTool } from './DrawableModdingTool';
import { ModdingColorPicker } from './ModdingColorPicker';

export class DrawableLineTool extends DrawableModdingTool {
  #currentObject = new ModPostLine();

  override createSettings(): Drawable {
    return new FillFlowContainer({
      direction: FillDirection.Horizontal,
      relativeSizeAxes: Axes.Both,
      children: [
        new ModdingColorPicker(),
      ],
    });
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#currentObject.position = e.mousePosition;
      this.#currentObject.startPosition = new Vec2();
      this.#currentObject.endPosition = new Vec2();
      this.#currentObject.color = this.composer.activeColor.value;

      this.modPost.add(this.#currentObject);

      return true;
    }

    return false;
  }

  override onDragStart(e: DragStartEvent): boolean {
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    this.#currentObject.endPosition = e.mousePosition.sub(this.#currentObject.position);

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.#currentObject = new ModPostLine();
  }
}
