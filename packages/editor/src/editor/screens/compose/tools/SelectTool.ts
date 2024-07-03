import { ComposeTool } from './ComposeTool';
import { DragStartEvent, MouseButton, MouseDownEvent } from 'osucad-framework';
import { SelectBoxInteraction } from './interactions/SelectBoxInteraction';

export class SelectTool extends ComposeTool {
  constructor() {
    super();
  }

  onDragStart(e: DragStartEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.beginInteraction(
        new SelectBoxInteraction(
          this.toLocalSpace(
            e.screenSpaceMouseDownPosition ?? e.screenSpaceMousePosition,
          ),
        ),
      );

      return true;
    }

    return false;
  }
}
