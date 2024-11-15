import { Additions } from '@osucad/common';
import { Bindable } from 'osucad-framework';

export class AdditionsBindable extends Bindable<Additions> {
  override get value() {
    return super.value;
  }

  override set value(value) {
    value &= Additions.All;

    super.value = value;
  }

  has(additions: Additions) {
    return !!(this.value & additions);
  }

  add(additions: Additions) {
    this.value |= additions;
  }

  remove(additions: Additions) {
    this.value &= ~additions;
  }
}
