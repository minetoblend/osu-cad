import {MenuItem, MenuItemOptions} from "./MenuItem.ts";
import {Container, Graphics} from "pixi.js";
import {ISize, Rect} from "@osucad/common";
import {Drawable} from "../Drawable.ts";
import gsap from "gsap";
import {Inject} from "../di";
import {VIEWPORT_SIZE} from "../injectionKeys.ts";

export interface MenuOptions {
  items: MenuItemOptions[];
  minWidth?: number;
}

export class Menu extends Drawable {

  private contentMask = new Graphics();

  @Inject(VIEWPORT_SIZE)
  private readonly viewportSize!: ISize;

  constructor(options: MenuOptions) {
    super();

    const { items, minWidth } = options;

    this.menuItems.addChild(...items.map(item => new MenuItem(item)));
    this.addChild(this.background, this.menuItems);

    this._minWidth = minWidth ?? 0;
  }

  onLoad() {
    this._calculateLayout();
    this.appear();
  }


  private background = new Graphics();

  private menuItems = new Container();

  private _minWidth: number;

  get minWidth() {
    return this._minWidth;
  }

  set minWidth(value: number) {
    this._minWidth = value;
    this._calculateLayout();
  }

  flipped = false;

  private _calculateLayout() {

    let width = this._minWidth;
    let height = 0;

    for (const item of this.menuItems.children) {
      if (item instanceof MenuItem) {
        const size = item.preferredSize;
        height += size.y;
        if (size.x > width) width = size.x;
      }
    }

    let y = 0;
    for (const item of this.menuItems.children) {
      if (item instanceof MenuItem) {
        const size = item.preferredSize;
        y += size.y;
        item.setBounds(new Rect(0, y - size.y, width, size.y));
      }
    }

    this.flipped = this.position.y + height > this.viewportSize.height - 50;
    console.log(this.position.y, height, this.viewportSize.height - 50);
    if (this.flipped) {
      this.pivot.set(0, height);
    } else {
      this.pivot.set(0, 0);
    }

    const bounds = new Rect(0, 0, width, height);

    this.background.clear()
      .roundRect(bounds.x + 2, bounds.y + 2, bounds.width, bounds.height, 5)
      .fill({
        color: 0x000000,
        alpha: 0.2,
      })
      .roundRect(bounds.x, bounds.y, bounds.width, bounds.height, 5)
      .fill(0x1A1A20);

    this.contentMask.clear()
      .roundRect(bounds.x, bounds.y, bounds.width, bounds.height, 5)
      .fill(0xffffff);

    this.menuItems.position.set(bounds.x, bounds.y);
  }

  appear() {
    this.alpha = 0;
    this.scale.set(0.8, 0.5);

    gsap.to(this, {
      alpha: 1,
      duration: 0.2,
      ease: "back.out",
    });

    gsap.to(this.scale, {
      x: 1,
      y: 1,
      duration: 0.2,
      ease: "back.out",
    });
  }

  hide(destroy = false) {
    gsap.to(this, {
      alpha: 0,
      duration: 0.1,
      ease: "power2.in",
    });

    gsap.to(this.scale, {
      x: 0.8,
      y: 0.5,
      duration: 0.1,
      ease: "power2.in",
    });

    if (destroy) {
      gsap.delayedCall(0.2, () => this.destroy());
    }
  }

}