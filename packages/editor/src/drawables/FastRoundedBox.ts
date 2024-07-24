import { Drawable, GAME_HOST, Invalidation, LayoutMember, PIXIContainer, clamp, resolved } from 'osucad-framework';
import type { DrawableOptions, GameHost } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import { Graphics, NineSliceSprite, RenderTexture } from 'pixi.js';

export interface FastRoundedBoxOptions extends DrawableOptions {
  cornerRadius?: number;
}

export class FastRoundedBox extends Drawable {
  private static textures: (Texture | undefined)[] = Array.from({ length: 100 });

  constructor(options: FastRoundedBoxOptions = {}) {
    super();

    this.apply(options);
  }

  @resolved(GAME_HOST)
  private host!: GameHost;

  createDrawNode(): PIXIContainer {
    return new PIXIContainer();
  }

  get cornerRadius(): number {
    return this.#cornerRadius;
  }

  set cornerRadius(value: number) {
    if (this.#cornerRadius === value)
      return;

    this.#cornerRadius = value;

    this.#textureBacking.invalidate();
  }

  #cornerRadius: number = 0;

  #textureBacking = new LayoutMember(Invalidation.None);

  override update() {
    super.update();

    if (!this.#textureBacking.isValid) {
      this.#updateTexture();
      this.#textureBacking.validate();
    }
  }

  #sprite: NineSliceSprite | null = null;

  #updateTexture() {
    this.drawNode.removeChildren();

    const radius = clamp(Math.round(this.#cornerRadius), 0, 99);

    if (!FastRoundedBox.textures[radius]) {
      const size = 2 * radius + 10;

      const texture = RenderTexture.create({
        width: size,
        height: size,
        antialias: true,
        resolution: 2,
      });

      const graphics = new Graphics()
        .roundRect(0, 0, size, size, radius)
        .fill({ color: 0xFFFFFF });

      this.host.renderer.internalRenderer.render({
        container: graphics,
        target: texture,
      });

      graphics.destroy();

      FastRoundedBox.textures[radius] = texture;
    }

    if (!this.#sprite) {
      this.drawNode.addChild(
        this.#sprite = new NineSliceSprite({
          texture: FastRoundedBox.textures[radius]!,
          topHeight: radius,
          bottomHeight: radius,
          rightWidth: radius,
          leftWidth: radius,
        }),
      );
    }
    else {
      this.#sprite.texture = FastRoundedBox.textures[radius]!;
      this.#sprite.topHeight = radius;
      this.#sprite.bottomHeight = radius;
      this.#sprite.rightWidth = radius;
      this.#sprite.leftWidth = radius;
    }
  }

  updateDrawNodeTransform() {
    super.updateDrawNodeTransform();

    if (!this.#sprite) {
      this.#updateTexture();
      this.#textureBacking.validate();
    }

    if (this.#sprite) {
      this.#sprite.width = this.drawSize.x;
      this.#sprite.height = this.drawSize.y;
    }
  }
}
