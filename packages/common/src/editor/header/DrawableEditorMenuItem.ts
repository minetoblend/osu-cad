import { Axes, type Drawable, DrawableMenuItem, type MenuItem, type ReadonlyDependencyContainer, RoundedBox } from 'osucad-framework';

import { DrawableEditorMenuItemContent } from './DrawableEditorMenuItemContent';

export class DrawableEditorMenuItem extends DrawableMenuItem {
  constructor(item: MenuItem) {
    super(item);
    this.backgroundColor = 'transparent';
    this.backgroundColorHover = 'rgba(255, 255, 255, 0.1)';
  }

  createContent(): Drawable {
    return new DrawableEditorMenuItemContent(this.item);
  }

  override createBackground(): Drawable {
    return new RoundedBox({
      color: 'transparent',
      cornerRadius: 4,
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
}
