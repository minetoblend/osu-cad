import { PIXIContainer } from '../../pixi';
import { Drawable } from './Drawable';

export class EmptyDrawable extends Drawable {
  override createDrawNode(): PIXIContainer {
    return new PIXIContainer();
  }
}
