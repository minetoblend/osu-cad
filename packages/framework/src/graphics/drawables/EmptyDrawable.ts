import { PIXIContainer } from '../../pixi.ts';
import { Drawable } from './Drawable.ts';

export class EmptyDrawable extends Drawable {
  override createDrawNode(): PIXIContainer {
    return new PIXIContainer();
  }
}
