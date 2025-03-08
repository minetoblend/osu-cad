import type { Texture } from 'pixi.js';
import type { PIXIContainer } from '../../pixi';
import type { DrawableOptions } from './Drawable';
import { Quad } from '../../math/Quad';
import { Vec2 } from '../../math/Vec2';
import { Drawable, Invalidation } from './Drawable';
import { LayoutComputed } from './LayoutComputed';
import { SpriteDrawNode } from './SpriteDrawNode';

export interface SpriteOptions extends DrawableOptions {
  texture?: Texture;
}

export class Sprite extends Drawable {
  #conservativeDrawQuad = new LayoutComputed<Quad>(() => {
    return Quad.fromRectangle(this.drawRectangle);
  }, Invalidation.RequiredParentSizeToFit | Invalidation.Presence);

  #drawNode!: SpriteDrawNode;

  protected override createDrawNode(): PIXIContainer {
    return this.#drawNode = new SpriteDrawNode(this);
  }

  #edgeSmoothness = new Vec2();
}
