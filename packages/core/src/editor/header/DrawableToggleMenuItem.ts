import type { Bindable, Drawable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { ToggleMenuItem } from '../../userInterface/ToggleMenuItem';
import { Toggle } from '../../userInterface/Toggle';
import { DrawableEditorMenuItem } from './DrawableEditorMenuItem';

import { DrawableEditorMenuItemContent } from './DrawableEditorMenuItemContent';

export class DrawableToggleMenuItem extends DrawableEditorMenuItem {
  override createContent(): Drawable {
    return new DrawableToggleMenuItemContent(this.item as ToggleMenuItem);
  }
}

export class DrawableToggleMenuItemContent extends DrawableEditorMenuItemContent {
  constructor(item: ToggleMenuItem) {
    super(item);

    this.active = item.active.getBoundCopy();
  }

  readonly active: Bindable<boolean>;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    let toggle: Toggle;

    this.add(toggle = new Toggle({ bindable: this.active }));

    if (this.spriteText)
      this.spriteText.x += toggle.drawWidth + 5;
  }
}
