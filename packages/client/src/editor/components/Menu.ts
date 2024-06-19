import { Axes } from '@/framework/drawable/Axes';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { Invalidation } from '@/framework/drawable/Invalidation';
import { RoundedBox } from '@/framework/drawable/RoundedBox';
import { Vec2 } from '@osucad/common';
import { MenuItem } from './MenuItem';
import gsap from 'gsap';
import { Anchor } from '@/framework/drawable/Anchor';
import { MouseDownEvent } from '@/framework/input/events/MouseEvent';
import { BackdropBlurFilter } from 'pixi-filters';

export interface MenuOptions {
  items: MenuItem[];
  minWidth?: number;
  anchor?: Anchor;
  origin?: Anchor;
  x?: number;
  y?: number;
}

export class Menu extends ContainerDrawable {
  constructor(options: MenuOptions) {
    super({
      anchor: options.anchor ?? Anchor.TopLeft,
      origin: options.origin ?? Anchor.TopLeft,
      x: options.x,
      y: options.y,
    });

    this.addInternal(this.background);
    this.addInternal(this.innerContainer);
    this.minWidth = options.minWidth ?? 150;

    const [filter] = (this.background.drawNode.filters = [
      new BackdropBlurFilter({
        strength: 15,
      }),
    ]);
    filter.padding = 15;

    this.addAll(options.items);
  }

  background = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    color: 0x222228,
    alpha: 0.6,
    cornerRadius: 4,
  });

  innerContainer = new ContainerDrawable<MenuItem>({
    relativeSizeAxes: Axes.Both,
    padding: 4,
  });

  minWidth: number;

  contentSize = new Vec2(0, 0);

  gap = 2;

  get content() {
    return this.innerContainer;
  }

  handleInvalidations(): void {
    super.handleInvalidations();
    if (this._invalidations & Invalidation.Layout) {
      let width = Math.max(
        this.minWidth,
        this.innerContainer.children.reduce(
          (max, child) => Math.max(max, child.requiredSizeToFit.x),
          0,
        ),
      );

      let y = 0;
      for (const child of this.innerContainer.children) {
        child.width = width;
        child.height = child.requiredSizeToFit.y;
        child.y = y;
        y += child.requiredSizeToFit.y + this.gap;
      }
      y -= this.gap;
      this.contentSize = new Vec2(width, y);
    }
  }

  get drawSize() {
    return this.contentSize.add({
      x: this.innerContainer.padding.horizontal,
      y: this.innerContainer.padding.vertical,
    });
  }

  parentItem?: MenuItem;

  appear() {
    this.scaleY = 0.5;
    this.y = -25;
    this.alpha = 0;
    this.isPresent = true;
    gsap.to(this, {
      y: 0,
      scaleY: 1,
      alpha: 1,
      duration: 0.2,
      ease: 'power2.out',
      onUpdate: () => {
        this.invalidate(Invalidation.DrawSize);
      },
    });
  }

  onMouseDown() {
    return true
  }
}
