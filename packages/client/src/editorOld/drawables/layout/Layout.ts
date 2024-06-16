import { Component, isComponent, LayoutInvalidation } from '../Component.ts';
import { LayoutContext } from './LayoutContext.ts';
import { Container } from 'pixi.js';

export abstract class Layout extends Component {
  readonly isLayout = true;

  _layoutSelf(ctx: LayoutContext) {
    this._layoutChildren(ctx);
    super._layoutSelf(ctx);
  }

  _layoutChildren(ctx: LayoutContext) {
    this.layoutChildren(ctx, this.children.filter(isComponent));
  }

  abstract layoutChildren(ctx: LayoutContext, children: Component[]): void;

  override addChild<U extends Container[]>(...children: U): U[0] {
    this.invalidateLayout(LayoutInvalidation.Self);
    return super.addChild(...children);
  }

  override removeChild<U extends Container[]>(...children: U): U[0] {
    this.invalidateLayout(LayoutInvalidation.Self);
    return super.removeChild(...children);
  }
}

export function isLayout(object: unknown): object is Layout {
  return (object as Layout)?.isLayout === true;
}
