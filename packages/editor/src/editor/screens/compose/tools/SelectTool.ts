import { ComposeTool } from './ComposeTool';
import { MouseButton, MouseDownEvent } from 'osucad-framework';
import { SelectBoxInteraction } from './interactions/SelectBoxInteraction';

export class SelectTool extends ComposeTool {
  constructor() {
    super();
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.beginInteraction(new SelectBoxInteraction(e.mousePosition));

      return true;
    }

    return false;
  }
}
