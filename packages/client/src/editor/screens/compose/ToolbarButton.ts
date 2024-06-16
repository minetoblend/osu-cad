import gsap from 'gsap';
import { DropShadowFilter } from 'pixi-filters';
import { Anchor } from '../../../framework/drawable/Anchor';
import { Axes } from '../../../framework/drawable/Axes';
import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from '../../../framework/drawable/ContainerDrawable';
import { DrawableSprite } from '../../../framework/drawable/DrawableSprite';
import { Invalidation } from '../../../framework/drawable/Invalidation';
import { RoundedBox } from '../../../framework/drawable/RoundedBox';
import { MouseDownEvent } from '../../../framework/input/events/MouseEvent';

export interface ToolbarButtonOptions extends ContainerDrawableOptions {
  icon?: string;
  active?: boolean;
  onClick: (event: MouseDownEvent) => void;
}

export class ToolbarButton extends ContainerDrawable {
  constructor(options: ToolbarButtonOptions) {
    const { icon, active, onClick, ...rest } = options;
    super(rest);
    this.addInternal(this._background);
    this.addInternal(this._outline);
    this.addInternal(this._content);
    this.onClick = onClick;
    this.icon = this.add(
      new DrawableSprite({
        relativeSizeAxes: Axes.Both,
        texture: icon,
        width: 0.65,
        height: 0.65,
        anchor: Anchor.Centre,
        origin: Anchor.Centre,
      }),
    );

    if (active !== undefined) this.active = active;

    // const [filter] = (this._background.drawNode.filters = [
    //   new BackdropBlurFilter({
    //     quality: 4,
    //     strength: 12,
    //     antialias: 'on',
    //     resolution: devicePixelRatio,
    //   }),
    // ]);
    // filter.padding = 16;

    this.updateState();
  }

  #active = false;

  get active() {
    return this.#active;
  }

  set active(value: boolean) {
    this.#active = value;
    this.updateState();
  }

  icon: DrawableSprite;

  _background = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    cornerRadius: 8,
    color: 0x222228,
    alpha: 0.8,
  });

  _outline = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    cornerRadius: 8,
    fillAlpha: 0,
  });

  _content = new ContainerDrawable({
    relativeSizeAxes: Axes.Both,
    children: [],
  });

  override get content() {
    return this._content;
  }

  #outlineVisibility = 0;

  get outlineVisibility() {
    return this.#outlineVisibility;
  }

  set outlineVisibility(value: number) {
    this.#outlineVisibility = value;
    this._outline.alpha = value;
  }

  updateOutline() {
    if (this.outlineVisibility === 0) {
      this._outline.outlines = [];
    } else {
      this._outline.outlines = [
        {
          color: 0xc0bfbd,
          width: 1.5 * this.outlineVisibility,
          alpha: 0.25 * this.outlineVisibility,
          alignment: 1,
        },
        {
          color: 0x32d2ac,
          width: 1.5 * this.outlineVisibility,
          alpha: 1 * this.outlineVisibility,
          alignment: 0,
        },
      ];
    }
  }

  updateState() {
    if (this.active) {
      this.icon.color = 0x32d2ac;
      // this.icon.drawNode.filters = [
      //   new DropShadowFilter({
      //     color: 0x32d2ac,
      //     offset: { x: 0, y: 0 },
      //     blur: 4,
      //     alpha: 0.25,
      //   }),
      // ];
      this._background.color = 0x303038;
      gsap.to(this, {
        outlineVisibility: 1,
        duration: 0.2,
        onUpdate: () => {
          this.updateOutline();
        },
      });
    } else {
      this._background.color = 0x222228;
      this.icon.color = 0xbbbec5;
      this.icon.drawNode.filters = [];
      gsap.to(this, {
        outlineVisibility: 0,
        duration: 0.2,
        onUpdate: () => {
          this.updateOutline();
        },
      });
    }
  }

  override onMouseDown(event: MouseDownEvent): boolean {
    if (event.left) {
      this.onClick(event);
      gsap.to(this.icon.scale, {
        x: 0.9,
        y: 0.9,
        duration: 0.05,
        ease: 'power2.out',
        onUpdate: () => {
          this.icon.invalidate(Invalidation.DrawSize);
        },
      });
    }

    return true;
  }

  override onMouseUp(): boolean {
    gsap.to(this.icon.scale, {
      x: 1,
      y: 1,
      duration: 0.1,
      onUpdate: () => {
        this.icon.invalidate(Invalidation.DrawSize);
      },
    });
    return true;
  }

  onHover(): boolean {
    if (!this.active) {
      this.icon.color = 0xffffff;
    }
    return false;
  }

  override onHoverLost(): boolean {
    if (!this.active) {
      this.icon.color = 0xbbbec5;
    }
    gsap.to(this.icon.scale, {
      x: 1,
      y: 1,
      duration: 0.1,
      onUpdate: () => {
        this.icon.invalidate(Invalidation.DrawSize);
      },
    });
    return false;
  }

  onClick: (event: MouseDownEvent) => void;
}
