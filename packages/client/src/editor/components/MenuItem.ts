import { Anchor } from '@/framework/drawable/Anchor';
import { Axes } from '@/framework/drawable/Axes';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { MarginPadding } from '@/framework/drawable/MarginPadding';
import { RoundedBox } from '@/framework/drawable/RoundedBox';
import { DrawableText } from '@/framework/drawable/SpriteText';
import { Menu } from './Menu';
import { MouseDownEvent } from '@/framework/input/events/MouseEvent';
import { Vec2 } from '@osucad/common';
import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader';
import { MenuContainer } from './MenuContainer';

export interface MenuItemOptions {
  text: string;
  items?: MenuItem[];
  isRoot?: boolean;
  action?: () => void;
  textAlign?: Anchor;
  padding?: MarginPadding;
  disabled?: boolean;
  shortcut?: string;
}

export class MenuItem extends ContainerDrawable {
  constructor(options: MenuItemOptions) {
    super();

    this.add(this.background);
    this.text = this.add(
      new DrawableText({
        text: options.text,
        fontSize: 12,
        color: 0xb6b6c3,
        anchor: options.textAlign ?? Anchor.CentreLeft,
        origin: options.textAlign ?? Anchor.CentreLeft,
        margin: options.padding ?? new MarginPadding(4),
      }),
    );

    this.items = options.items ?? [];
    this.action = options.action;
    this.disabled = options.disabled ?? false;

    if(options.shortcut) {
      this.shortcut = this.addInternal(new DrawableText({
        text: options.shortcut,
        fontSize: 10,
        color: 0xb6b6c3,
        alpha: 0.75,
        anchor: Anchor.CentreRight,
        origin: Anchor.CentreRight,
        margin: new MarginPadding(4),
      }))
    }
  }

  items: MenuItem[];

  text: DrawableText;

  shortcut?: DrawableText;

  submenu?: Menu;

  action?: () => void;

  background = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    cornerRadius: 2,
    alpha: 0,
  });

  get requiredSizeToFit() {
    return this.text.requiredSizeToFit.add({
      x: this.text.margin.horizontal,
      y: this.text.margin.vertical,
    });
  }

  get drawSize() {
    return new Vec2(
      Math.max(this.requiredSizeToFit.x, super.drawSize.x),
      Math.max(this.requiredSizeToFit.y, super.drawSize.y),
    );
  }

  onHover() {
    this.background.alpha = 0.1;
    return true;
  }

  onHoverLost() {
    this.background.alpha = 0;
    return true;
  }

  @resolved(MenuContainer)
  menuContainer!: MenuContainer;

  #disabled = false;

  get disabled() {
    return this.#disabled;
  }

  set disabled(value: boolean) {
    this.#disabled = value;
    this.alpha = value ? 0.65 : 1;
  }

  onMouseDown(event: MouseDownEvent): boolean {
    if (event.left) {
      if (this.items.length === 0) {
        this.action?.();
        this.menuContainer.hideAll();
        this.background.alpha = 0.2;
        return true;
      }

      if (this.submenu && !this.submenu.destroyed) {
        this.menuContainer.hide(this.submenu);
      } else if (this.items.length > 0) {
        this.menuContainer.show(this, this.items);
      }
    }
    return true;
  }

  get isRoot() {
    return !this.findParentOfType(Menu);
  }

  receivePositionalInputAt(screenSpacePos: Vec2): boolean {
    return !this.disabled && super.receivePositionalInputAt(screenSpacePos);
  }

  @dependencyLoader() 
  load() {
    if(this.items.length > 0 && !this.isRoot) {
      this.addInternal(new RoundedBox({
        relativeSizeAxes: Axes.Y,
        width: 2,
        cornerRadius: 1,
        color: 0xffffff,
        alpha: 0.25,
        margin: new MarginPadding({
          vertical: 4,
          right: 4,
        }),
        anchor: Anchor.CentreRight,
        origin: Anchor.CentreRight,
      }))
    }
  }
}
