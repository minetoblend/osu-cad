import { Bindable } from './Bindable.ts';

export class BindableBoolean extends Bindable<boolean> {
  constructor(defaultValue: boolean = false) {
    super(defaultValue);
  }

  toggle() {
    this.value = !this.value;
  }

  override createInstance(): BindableBoolean {
    return new BindableBoolean();
  }

  override getBoundCopy(): BindableBoolean {
    return super.getBoundCopy() as BindableBoolean;
  }
}
