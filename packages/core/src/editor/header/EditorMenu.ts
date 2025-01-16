import type { Drawable, DrawableMenuItem, MenuItem } from '@osucad/framework';
import { Axes, Color, dependencyLoader, Direction, EasingFunction, FastRoundedBox, Menu, ScrollbarContainer, ScrollContainer, Vec2 } from '@osucad/framework';
import { OsucadColors } from '../../OsucadColors';
import { ToggleMenuItem } from '../../userInterface/ToggleMenuItem';
import { DrawableEditorMenuItem } from './DrawableEditorMenuItem';
import { DrawableToggleMenuItem } from './DrawableToggleMenuItem';

export class EditorMenu extends Menu {
  @dependencyLoader()
  [Symbol('load')]() {
    if (this.topLevelMenu)
      return;

    this.backgroundColor = new Color(OsucadColors.translucent).setAlpha(0.85);
  }

  protected override createBackground(): Drawable {
    return new FastRoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 4,
    });
  }

  protected createSubmenu(): Menu {
    return new EditorMenu(Direction.Vertical);
  }

  protected createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    if (item instanceof ToggleMenuItem)
      return new DrawableToggleMenuItem(item);

    return new DrawableEditorMenuItem(item);
  }

  protected createScrollContainer(direction: Direction): ScrollContainer {
    return new (class extends ScrollContainer {
      constructor(direction: Direction) {
        super(direction);
        this.clampExtension = 0;
      }

      protected createScrollbar(direction: Direction): ScrollbarContainer {
        return new (class extends ScrollbarContainer {
          resizeScrollbarTo(): void {
          }
        })(direction);
      }
    })(direction);
  }

  override animateOpen(): void {
    if (this.topLevelMenu) {
      super.animateOpen();
      return;
    }
    this.fadeIn(200);
  }

  #targetSize: Vec2 = new Vec2();

  protected override updateSize(newSize: Vec2): void {
    if (this.#targetSize.equals(newSize))
      return;

    this.clearTransforms(false, 'size');

    if (this.direction === Direction.Vertical) {
      if (newSize.y === 0)
        newSize.x = this.width;

      if (newSize.y > 0 && this.width === 0)
        this.width = newSize.x;
    }

    this.resizeTo(newSize, 200, EasingFunction.OutQuart);
  }

  override animateClose(): void {
    if (this.topLevelMenu) {
      super.animateClose();
      return;
    }

    this.fadeOut(200);
  }
}
