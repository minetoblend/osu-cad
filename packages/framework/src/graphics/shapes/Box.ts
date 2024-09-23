import { PIXIContainer, PIXISprite, PIXITexture } from '../../pixi';
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
        (this.#sprite = new PIXISprite({
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
