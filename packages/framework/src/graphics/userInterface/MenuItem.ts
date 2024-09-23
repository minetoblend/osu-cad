import { Bindable } from '../../bindables';

export interface MenuItemOptions {
  text: string;
  disabled?: boolean;
  action?: (() => void) | undefined;
  items?: MenuItem[];
}

export class MenuItem {
  text = new Bindable<string>('');

  action = new Bindable<(() => void) | undefined>(undefined);

  disabled = new Bindable<boolean>(false);

  items: ReadonlyArray<MenuItem> = [];

  constructor(options: MenuItemOptions) {
    this.text.value = options.text;
    this.action.value = options.action;
    this.disabled.value = options.disabled ?? false;
    this.items = options.items ?? [];
  }
}
