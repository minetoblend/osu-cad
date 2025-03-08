import type { Drawable, MenuItem, ReadonlyDependencyContainer } from '@osucad/framework';
import { Axes, Box, DrawableMenuItem } from '@osucad/framework';

import { DrawableEditorMenuItemContent } from './DrawableEditorMenuItemContent';

export class DrawableEditorMenuItem extends DrawableMenuItem {
  constructor(item: MenuItem) {
    super(item);
    this.backgroundColor = 'transparent';
    this.backgroundColorHover = 'rgba(255, 255, 255, 0.1)';
  }

  protected menuItemContent?: DrawableEditorMenuItemContent;

  createContent(): Drawable {
    this.menuItemContent ??= new DrawableEditorMenuItemContent(this.item);

    return this.menuItemContent;
  }

  override createBackground(): Drawable {
    return new Box({
      color: 'transparent',
      relativeSizeAxes: Axes.Both,
    });
  }

  override get closeMenuOnClick(): boolean {
    return false;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.item.disabled.addOnChangeListener(
      (e) => {
        if (e.value) {
          this.foreground.alpha = 0.5;
        }
        else {
          this.foreground.alpha = 1;
        }
      },
      { immediate: true },
    );
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.menuItemContent?.dispose();
  }

  override get disposeOnDeathRemoval(): boolean {
    return false;
  }
}
