import type { MouseDownEvent, MouseUpEvent } from 'osucad-framework';
import { MouseButton } from 'osucad-framework';
import { ComposeToolbarToolButton } from './ComposeToolbarToolButton';

export class SliderPresetButton extends ComposeToolbarToolButton {
  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.active = true;
    }

    return super.onMouseDown(e);
  }

  onMouseUp(e: MouseUpEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.active = false;
    }

    return super.onMouseUp(e);
  }
}
