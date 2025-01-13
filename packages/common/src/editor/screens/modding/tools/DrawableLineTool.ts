import type { ClickEvent, DragEndEvent, DragEvent, DragStartEvent, Drawable, HoverEvent, MouseDownEvent, MouseMoveEvent } from 'osucad-framework';
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
      padding: { vertical: 8 },
      children: [
        new ModdingColorPicker(),
      ],
    });
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#currentObject.position = this.snappedMousePosition;
      this.#currentObject.startPosition = new Vec2();
      this.#currentObject.endPosition = new Vec2();
      this.#currentObject.color = this.composer.activeColor.value;

      this.modPost.add(this.#currentObject);

      return true;
    }

    return false;
  }

  clickEndPosition: Vec2 | null = null;

  override onHover(e: HoverEvent): boolean {
    return false;
  }

  override onClick(e: ClickEvent): boolean {
    if (this.clickEndPosition) {
      this.#currentObject.endPosition = this.clickEndPosition.sub(this.#currentObject.position);
      this.#currentObject = new ModPostLine();
      this.showVisualizer = false;
    }
    else {
      this.modPost.remove(this.#currentObject);
    }
    return true;
  }

  override onMouseMove(e: MouseMoveEvent): boolean {
    this.showVisualizer = true;
    return false;
  }

  override onDragStart(e: DragStartEvent): boolean {
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    this.#currentObject.endPosition = this.snappedMousePosition.sub(this.#currentObject.position);

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.#currentObject = new ModPostLine();
  }

  get snappedMousePosition() {
    return this.playfieldMousePosition;
  }

  showVisualizer = true;
}
