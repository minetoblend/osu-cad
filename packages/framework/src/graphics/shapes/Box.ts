import type { PIXISprite } from '../../pixi';
import { PIXIContainer, PIXITexture } from '../../pixi';
import { OsucadSprite } from '../../renderers/OsucadSprite';
import { Drawable, type DrawableOptions } from '../drawables/Drawable';

export class Box extends Drawable {
  constructor(options: DrawableOptions = {}) {
    super();
    this.with(options);
  }

  #sprite!: PIXISprite;

  override createDrawNode(): PIXIContainer {
    return new PIXIContainer({
      children: [
        (this.#sprite = new OsucadSprite({
          texture: PIXITexture.WHITE,
        })),
      ],
    });
  }

  override updateDrawNodeTransform() {
    super.updateDrawNodeTransform();
    this.#sprite.width = this.drawSize.x;
    this.#sprite.height = this.drawSize.y;
  }
}
