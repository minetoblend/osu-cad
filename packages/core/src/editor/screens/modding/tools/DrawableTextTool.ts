import type { Container, DragEndEvent, DragEvent, DragStartEvent } from '@osucad/framework';
import { Axes, MaskingContainer, RoundedBox } from '@osucad/framework';
import { OsucadSpriteText } from '../../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../../OsucadColors';
import { TimestampFormatter } from '../../../TimestampFormatter';
import { DrawableModdingTool } from './DrawableModdingTool';

export class DrawableTextTool extends DrawableModdingTool {
  constructor() {
    super();
  }

  #dragBox?: Container;

  override onDragStart(e: DragStartEvent): boolean {
    this.addInternal(
      this.#dragBox = new MaskingContainer({
        children: [
          new RoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 0.5,
            fillAlpha: 0.2,
            fillColor: 0x000000,
            outlines: [{
              width: 1,
              color: OsucadColors.text,
              alpha: 0.5,
            }],
          }),
          new OsucadSpriteText({
            text: `${TimestampFormatter.formatTimestamp(this.editorClock.currentTimeAccurate)} - `,
            color: OsucadColors.text,
          }),
        ],
      }),
    );

    return true;
  }

  override onDrag(e: DragEvent): boolean {
    if (!this.#dragBox)
      return false;

    const start = this.toLocalSpace(e.screenSpaceMouseDownPosition);
    const end = e.mousePosition;

    const min = start.componentMin(end);
    const max = start.componentMax(end);

    this.#dragBox.position = min;
    this.#dragBox.size = max.sub(min);

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.#dragBox?.expire();
  }
}
