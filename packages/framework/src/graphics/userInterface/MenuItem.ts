import { Bindable } from "../../bindables";

export interface MenuItemOptions
{
  text: string;
  disabled?: boolean;
  action?: (() => void) | undefined;
  items?: MenuItem[];
}

export class MenuItem
{
  public readonly text = new Bindable<string>("");

  public readonly action = new Bindable<(() => void) | undefined>(undefined);

  public readonly disabled = new Bindable<boolean>(false);

  public readonly items: ReadonlyArray<MenuItem> = [];

  public constructor(options: MenuItemOptions)
  {
    this.text.value = options.text;
    this.action.value = options.action;
    this.disabled.value = options.disabled ?? false;
    this.items = options.items ?? [];
  }
}
