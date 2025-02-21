import type { Properties } from '@pixi/devtools';
import type { Texture } from 'pixi.js';
import type { GameHost } from '../../platform/GameHost';
import { Graphics, NineSliceSprite, RenderTexture } from 'pixi.js';
import { resolved } from '../../di';
import { GAME_HOST } from '../../injectionTokens';
import { PIXIContainer } from '../../pixi';
import { clamp } from '../../utils';
import { Drawable, type DrawableOptions, Invalidation } from '../drawables/Drawable';
import { LayoutMember } from '../drawables/LayoutMember';

export interface FastRoundedBoxOptions extends DrawableOptions {
  cornerRadius?: number;
}

export class FastRoundedBox extends Drawable {
  private static textures: (Texture | undefined)[] = Array.from({ length: 100 });

  constructor(options: FastRoundedBoxOptions = {}) {
    super();

    this.with(options);
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

  override updateDrawNodeTransform() {
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

  override get devToolProps(): Properties[] {
    return [
      ...super.devToolProps,
      {
        prop: 'cornerRadius',
        entry: {
          type: 'number',
          section: 'FastRoundedBox',
        },
      },
    ];
  }
}
