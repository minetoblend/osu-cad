import {
  Container,
  ExtensionMetadata,
  extensions,
  ExtensionType,
  Renderer,
} from 'pixi.js';
import { LayoutContext } from './LayoutContext.ts';
import { Vec2 } from '@osucad/common';
import { isComponent } from '../Component.ts';

export class LayoutSystem {
  static extension: ExtensionMetadata = {
    type: [ExtensionType.WebGLSystem, ExtensionType.WebGPUSystem],
    name: 'layout',
  };

  private _renderer: Renderer;

  constructor(renderer: Renderer) {
    this._renderer = renderer;
  }

  init() {
    this._renderer.runners.prerender.add(this);
    this._renderer.runners.postrender.add(this);
  }

  public prerender(): void {
    const ctx = new LayoutContext(
      new Vec2(
        this._renderer.view.screen.width,
        this._renderer.view.screen.height,
      ),
    );
    this._updateLayoutRecursive(this._renderer.lastObjectRendered, ctx);
  }

  private _updateLayoutRecursive(view: Container, ctx: LayoutContext) {
    if (isComponent(view) && view.layoutInvalid) {
      view._layoutSelf(ctx);
    }
    if (view.children.length > 0) {
      for (const child of view.children) {
        this._updateLayoutRecursive(child, ctx);
      }
    }
  }
}

extensions.add(LayoutSystem);
