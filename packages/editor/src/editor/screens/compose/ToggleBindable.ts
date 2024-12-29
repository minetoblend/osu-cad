import { Bindable } from 'osucad-framework';

export class ToggleBindable extends Bindable<boolean> {
  constructor(value: boolean) {
    super(value);
  }

  buttonPressed = false;

  toggle() {
    this.value = !this.value;
  }
}
