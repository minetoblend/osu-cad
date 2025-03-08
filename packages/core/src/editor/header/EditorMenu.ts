import type { Drawable, DrawableMenuItem, MenuItem, ReadonlyDependencyContainer } from '@osucad/framework';
import { Axes, Box, Color, Direction, EasingFunction, Menu, ScrollbarContainer, ScrollContainer, Vec2 } from '@osucad/framework';
import { OsucadColors } from '../../OsucadColors';
import { ToggleMenuItem } from '../../userInterface/ToggleMenuItem';
import { DrawableEditorMenuItem } from './DrawableEditorMenuItem';
import { DrawableToggleMenuItem } from './DrawableToggleMenuItem';

export class EditorMenu extends Menu {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    if (this.topLevelMenu)
      return;

    this.maskingContainer.cornerRadius = 4;

    this.backgroundColor = new Color(OsucadColors.translucent);
  }

  protected override createBackground(): Drawable {
    return new Box({
      relativeSizeAxes: Axes.Both,
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
