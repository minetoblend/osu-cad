import type { Spinner } from '@osucad/common';
import type { DragEvent, DragStartEvent } from 'osucad-framework';
import { Anchor, FillMode, MouseButton } from 'osucad-framework';
import { TimelineElement } from './TimelineElement';

export class TimelineSpinnerTail extends TimelineElement {
  constructor(readonly hitObject: Spinner) {
    super({
      bodyColor: hitObject.comboColor,
      fillMode: FillMode.Fit,
      anchor: Anchor.CenterRight,
      origin: Anchor.CenterRight,
    });
  }

  onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  onDrag(e: DragEvent): boolean {
    return true;
  }
}
