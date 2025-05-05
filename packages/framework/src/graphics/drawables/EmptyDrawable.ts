import { Container as PIXIContainer } from 'pixi.js';
import { Drawable } from './Drawable';

export class EmptyDrawable extends Drawable {
  override createDrawNode(): PIXIContainer {
    return new PIXIContainer();
  }
}
