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
}
