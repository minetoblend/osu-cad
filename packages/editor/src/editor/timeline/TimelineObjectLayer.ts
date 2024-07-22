import { Drawable, type DrawableOptions, GAME_HOST, type GameHost, PIXIContainer, resolved } from 'osucad-framework';
import { Graphics, NineSliceSprite, RenderTexture } from 'pixi.js';

const textures = {
  body: RenderTexture.create({
    width: 256,
    height: 128,
  }),
  outline: RenderTexture.create({
    width: 256,
    height: 128,
  }),
};

let texturesInitialized = false;

const texturePadding = 12;

export class TimelineObjectLayer extends Drawable {
  constructor(
    readonly type: 'body' | 'outline',
    options: DrawableOptions = {},
  ) {
    super();

    this.drawNode.addChild(
      this.#sprite = new NineSliceSprite({
        texture: textures![this.type],
        topHeight: 64,
        bottomHeight: 64,
        rightWidth: 64,
        leftWidth: 64,
        height: 128,
      }),
    );

    this.apply(options);
  }

  @resolved(GAME_HOST)
  private host!: GameHost;

  createDrawNode(): PIXIContainer {
    return new PIXIContainer();
  }

  override update() {
    super.update();
  }

  readonly #sprite: NineSliceSprite;

  #createTextures() {
    if (texturesInitialized)
      return;

    const graphics = new Graphics()
      .roundRect(
        texturePadding,
        texturePadding,
        256 - texturePadding * 2,
        128 - texturePadding * 2,
        64 - texturePadding,
      )
      .fill({ color: 0xFFFFFF });

    this.host.renderer.internalRenderer.render({
      container: graphics,
      target: textures.body,
    });

    graphics
      .clear()
      .roundRect(
        texturePadding,
        texturePadding,
        256 - texturePadding * 2,
        128 - texturePadding * 2,
        64 - texturePadding,
      )
      .stroke({ color: 0xFFFFFF, width: 6, alignment: 1 });

    this.host.renderer.internalRenderer.render({
      container: graphics,
      target: textures.outline,
    });

    graphics.destroy();

    texturesInitialized = true;
  }

  updateDrawNodeTransform() {
    super.updateDrawNodeTransform();

    if (!texturesInitialized) {
      this.#createTextures();
    }

    const drawSize = this.drawSize;
    const scale = drawSize.y / (128 - 24);

    this.#sprite.width = drawSize.x / scale + texturePadding * 2;
    this.#sprite.scale.set(scale);
    this.#sprite.position.set(-texturePadding * scale);
  }
}
