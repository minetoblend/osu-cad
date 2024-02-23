import { Container, ObservablePoint } from 'pixi.js';
import { Drawable } from './Drawable.ts';
import { Rect } from '@osucad/common';
import { LayoutContext } from './layout/LayoutContext.ts';

export class Component extends Drawable {
  constructor() {
    super();
    this.hitArea = {
      contains: (x: number, y: number) => {
        return x >= 0 && x <= this.size.x && y >= 0 && y <= this.size.y;
      },
    };
  }

  size = new ObservablePoint(this, 0, 0);

  readonly isComponent = true;

  layoutInvalid = true;

  _layoutSelf(ctx: LayoutContext) {
    this.layoutSelf?.(ctx);
    this.layoutInvalid = false;
  }

  layoutSelf?(ctx: LayoutContext): void;

  setBounds(bounds: Rect) {
    this.size.set(bounds.width, bounds.height);
    this.position.set(bounds.x, bounds.y);
  }

  private _preferredWidth?: number;
  private _preferredHeight?: number;
  private _minWidth?: number;
  private _minHeight?: number;
  private _maxWidth?: number;
  private _maxHeight?: number;

  get preferredWidth() {
    return this._preferredWidth;
  }

  set preferredWidth(value: number | undefined) {
    if (value === this._preferredWidth) return;
    this._preferredWidth = value;
    this.invalidateLayout(LayoutInvalidation.Self | LayoutInvalidation.Parent);
  }

  get preferredHeight() {
    return this._preferredHeight;
  }

  set preferredHeight(value: number | undefined) {
    if (value === this._preferredHeight) return;
    this._preferredHeight = value;
    this.invalidateLayout(LayoutInvalidation.Self | LayoutInvalidation.Parent);
  }

  get minWidth() {
    return this._minWidth;
  }

  set minWidth(value: number | undefined) {
    if (value === this._minWidth) return;
    this._minWidth = value;
    this.invalidateLayout(LayoutInvalidation.Self | LayoutInvalidation.Parent);
  }

  get minHeight() {
    return this._minHeight;
  }

  set minHeight(value: number | undefined) {
    if (value === this._minHeight) return;
    this._minHeight = value;
    this.invalidateLayout(LayoutInvalidation.Self | LayoutInvalidation.Parent);
  }

  get maxWidth() {
    return this._maxWidth;
  }

  private _margin = 0;

  get margin() {
    return this._margin;
  }

  set margin(value: number) {
    if (value === this._margin) return;
    this._margin = value;
    this.invalidateLayout(LayoutInvalidation.Self | LayoutInvalidation.Parent);
  }

  set maxWidth(value: number | undefined) {
    if (value === this._maxWidth) return;
    this._maxWidth = value;
    this.invalidateLayout(LayoutInvalidation.Self | LayoutInvalidation.Parent);
  }

  get maxHeight() {
    return this._maxHeight;
  }

  set maxHeight(value: number | undefined) {
    if (value === this._maxHeight) return;
    this._maxHeight = value;
    this.invalidateLayout(LayoutInvalidation.Self | LayoutInvalidation.Parent);
  }

  protected invalidateLayout(invalidation: LayoutInvalidation) {
    if (invalidation & LayoutInvalidation.Self) {
      this.layoutInvalid = true;
    }
    if (invalidation & LayoutInvalidation.Parent) {
      const parent = this.parent;
      if (parent && isComponent(parent)) {
        parent.layoutInvalid = true;
      }
    }
  }
}

export const enum LayoutInvalidation {
  Self = 1 << 0,
  Parent = 1 << 1,
}

export function isComponent(object: Container): object is Component {
  return (object as any).isComponent;
}
