import { Axes } from '@/framework/drawable/Axes';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import type { MenuItem as MenuItemType } from './MenuItem';
import type { Menu as MenuType } from './Menu';
import { Anchor } from '@/framework/drawable/Anchor';
import gsap from 'gsap';
import { MouseDownEvent } from '@/framework/input/events/MouseEvent';
import { Drawable } from '@/framework/drawable/Drawable';
import { dependencyLoader } from '@/framework/di/DependencyLoader';

let MenuItem: typeof import('./MenuItem').MenuItem;
let Menu: typeof import('./Menu').Menu;

export class MenuContainer extends ContainerDrawable {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  @dependencyLoader()
  async load() {
    MenuItem ??= (await import('./MenuItem')).MenuItem;
    Menu ??= (await import('./Menu')).Menu;
  }

  openMenus: MenuType[] = [];

  submenus = new Map<Drawable, MenuType>();
  menuOwners = new Map<MenuType, Drawable>();

  shouldRemove: MenuType[] = [];

  show(item: Drawable, children: MenuItemType[], origin?: Anchor): MenuType {
    if (!origin) {
      origin =
        !(item instanceof MenuItem) || item.isRoot
          ? Anchor.BottomLeft
          : Anchor.TopRight;
    }

    for (const menu of this.openMenus) {
      if (!this.isSubmenu(item, menu)) {
        this.shouldRemove.push(menu);
      }
    }

    const menu = new Menu({
      items: children,
      anchor: Anchor.TopLeft,
    });

    const originPos = item.drawSize.clone();

    if (origin & Anchor.x0) {
      originPos.x = 0;
    } else if (origin & Anchor.x1) {
      originPos.x *= 0.5;
    }

    if (origin & Anchor.y0) {
      originPos.y = 0;
    } else if (origin & Anchor.y1) {
      originPos.y *= 0.5;
    }

    const screenSpacePosition = item.drawNode.toGlobal(originPos);
    const localPosition = this.toLocalSpace(screenSpacePosition);

    menu.position = localPosition;

    menu.alpha = 0;
    menu.scaleY = 0.8;
    menu.y -= 10;

    this.addInternal(menu);
    this.openMenus.push(menu);
    this.submenus.set(item, menu);
    this.menuOwners.set(menu, item);
    if (item instanceof MenuItem) {
      menu.parentItem = item;
      item.submenu = menu;
    }

    menu.update();

    if (menu.drawPosition.x + menu.drawSize.x > this.drawSize.x) {
      menu.anchor = Anchor.TopRight;
      const screenSpacePosition = item.drawNode.toGlobal(
        originPos.mul({ x: 0, y: 1 }),
      );
      const localPosition = this.toLocalSpace(screenSpacePosition);
      menu.position = localPosition.sub({ x: 4, y: 0 });
    }

    gsap.to(menu, {
      alpha: 1,
      scaleY: 1,
      y: localPosition.y,
      duration: 0.1,
      ease: 'power2.out',
    });

    return menu;
  }

  hide(menu: MenuType) {
    const index = this.openMenus.indexOf(menu);

    if (index === -1) return;
    this.openMenus.splice(index, 1);

    const owner = this.menuOwners.get(menu);
    if (owner) {
      this.submenus.delete(owner);
    }

    if (menu.parentItem) {
      menu.parentItem.submenu = undefined;
    }

    gsap.to(menu, {
      alpha: 0,
      scaleY: 0.9,
      duration: 0.1,
      ease: 'power2.in',
      onComplete: () => {
        menu.destroy();
      },
    });
  }

  hideAll() {
    for (const menu of [...this.openMenus]) {
      this.hide(menu);
    }
  }

  receivePositionalInputAt(): boolean {
    return true;
  }

  onMouseDown(event: MouseDownEvent) {
    if (event.left) {
      if (this.children.length > 0) {
        this.shouldRemove.push(...this.openMenus);
        return false;
      }
    }
    return false;
  }

  private isSubmenu(item: Drawable, menu: MenuType) {
    let current = menu as MenuType | undefined;
    while (current) {
      if (this.isNestedChild(item)) {
        return true;
      }
      current = current.parentItem?.findParentOfType(Menu);
    }
    return false;
  }

  hasMenu(item: Drawable) {
    return !!this.submenus.get(item);
  }

  onTick(): void {
    for (const menu of this.shouldRemove) {
      this.hide(menu);
    }
    this.shouldRemove.length = 0;
  }
}
