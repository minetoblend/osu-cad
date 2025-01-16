import type { MenuItemOptions } from '@osucad/framework';
import { MenuItem } from '@osucad/framework';

export type MenuItemType = 'destructive';

export interface OsucadMenuItemOptions extends MenuItemOptions {
  type?: MenuItemType;
}

export class OsucadMenuItem extends MenuItem {
  readonly type?: MenuItemType;

  constructor(options: OsucadMenuItemOptions) {
    const { type, ...rest } = options;

    super(rest);
    this.type = type;
  }
}
