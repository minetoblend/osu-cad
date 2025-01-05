import type { Bindable } from 'osucad-framework';
import type { OsucadMenuItemOptions } from './OsucadMenuItem';
import { OsucadMenuItem } from './OsucadMenuItem';

export interface ToggleMenuItemOptions extends Omit<OsucadMenuItemOptions, 'action'> {
  active: Bindable<boolean>;
}

export class ToggleMenuItem extends OsucadMenuItem {
  constructor(options: ToggleMenuItemOptions) {
    super({
      ...options,
      action: () => this.active.value = !this.active.value,
    });

    this.active = options.active;
  }

  readonly active: Bindable<boolean>;
}
