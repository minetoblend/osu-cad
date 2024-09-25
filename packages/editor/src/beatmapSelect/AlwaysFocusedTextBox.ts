import type { KeyBindingPressEvent } from 'osucad-framework';
import { PlatformAction } from 'osucad-framework';
import { TextBox } from '../userInterface/TextBox';

export class AlwaysFocusedTextBox extends TextBox {
  override onFocusLost() {
    super.onFocusLost();

    this.schedule(() => this.getContainingFocusManager()?.changeFocus(this));
  }

  protected loadComplete() {
    super.loadComplete();

    this.getContainingFocusManager()?.changeFocus(this);
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean {
    if (e.pressed === PlatformAction.MoveForwardChar || e.pressed === PlatformAction.MoveBackwardChar)
      return false;

    return super.onKeyBindingPressed(e);
  }
}
