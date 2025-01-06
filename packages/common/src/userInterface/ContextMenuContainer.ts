import type { ContainerOptions, MenuItem, MouseDownEvent, UIEvent } from 'osucad-framework';
import { Anchor, Axes, Container, Drawable, provide, Vec2 } from 'osucad-framework';
import { ContextMenu } from './ContextMenu';

@provide()
export class ContextMenuContainer extends Container {
  constructor(options: ContainerOptions) {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.internalChildren = [
      this.#content,
      this.#menuContainer,
    ];

    this.with(options);
  }

  #menuContainer = new ContextMenuOverlay(this);

  #content = new Container({
    relativeSizeAxes: Axes.Both,
  });

  override get content(): Container {
    return this.#content;
  }

  showMenu(items: MenuItem[], position: Drawable | Vec2 | UIEvent) {
    const localPosition = this.toLocalSpace(
      position instanceof Drawable
        ? position.toScreenSpace(position.drawSize.scale(0.5))
        : position instanceof Vec2
          ? position
          : position.screenSpaceMousePosition,
    );

    this.hideActiveMenu();

    const menu = new ContextMenu(true);
    menu.items = items;
    menu.position = localPosition;

    this.#menuContainer.add(menu);

    this.#activeMenu = menu;

    menu.animateOpen();

    this.scheduler.addDelayed(() => {
      if (this.toLocalSpace(menu.toScreenSpace(new Vec2(0, menu.drawHeight))).y > this.height) {
        menu.origin = Anchor.BottomLeft;
      }
    }, 50);
  }

  #activeMenu?: ContextMenu;

  hideActiveMenu() {
    if (this.#activeMenu) {
      this.#activeMenu.animateClose();
      this.#activeMenu.expire();
      this.#activeMenu = undefined;
    }
  }
}

export class ContextMenuOverlay extends Container {
  constructor(readonly container: ContextMenuContainer) {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    this.container.hideActiveMenu();
    return false;
  }
}
