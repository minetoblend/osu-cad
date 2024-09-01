import type { MouseDownEvent, MouseUpEvent } from 'osucad-framework';
import { MouseButton } from 'osucad-framework';
import { ComposeToolbarToolButton } from './ComposeToolbarToolButton';

export class SliderPresetButton extends ComposeToolbarToolButton {
  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.active.value = true;
    }

    return super.onMouseDown(e);
  }

  onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left) {
      this.active.value = false;
    }

    return super.onMouseUp(e);
  }
}
