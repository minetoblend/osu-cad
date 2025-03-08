import type { Container, InstructionSet, PoolItem, Renderer, RenderPipe, Sprite } from 'pixi.js';
import { BigPool, ExtensionType, Rectangle } from 'pixi.js';
import { OsucadBatchableSprite } from './OsucadBatchableSprite';

export class OsucadSpritePipe implements RenderPipe<Sprite> {
  /** @ignore */
  public static extension = {
    type: [
      ExtensionType.WebGLPipes,
      ExtensionType.WebGPUPipes,
      ExtensionType.CanvasPipes,
    ],
    name: 'osucad-sprite',
  } as const;

  private _renderer: Renderer;
  private _gpuSpriteHash: Record<number, OsucadBatchableSprite> = Object.create(null);
  private readonly _destroyRenderableBound = this.destroyRenderable.bind(this) as (renderable: Container<any>) => void;

  constructor(renderer: Renderer) {
    this._renderer = renderer;
    this._renderer.renderableGC.addManagedHash(this, '_gpuSpriteHash');
  }

  public addRenderable(sprite: Sprite, instructionSet: InstructionSet) {
    const gpuSprite = this._getGpuSprite(sprite);

    if (sprite.didViewUpdate)
      this._updateBatchableSprite(sprite, gpuSprite);

    // TODO visibility
    this._renderer.renderPipes.batch.addToBatch(gpuSprite, instructionSet);
  }

  public updateRenderable(sprite: Sprite) {
    const gpuSprite = this._gpuSpriteHash[sprite.uid];

    if (sprite.didViewUpdate)
      this._updateBatchableSprite(sprite, gpuSprite);

    gpuSprite._batcher.updateElement(gpuSprite);
  }

  public validateRenderable(sprite: Sprite): boolean {
    const texture = sprite._texture;
    const gpuSprite = this._getGpuSprite(sprite);

    if (gpuSprite.texture._source !== texture._source) {
      return !gpuSprite._batcher.checkAndUpdateTexture(gpuSprite, texture);
    }

    return false;
  }

  public destroyRenderable(sprite: Sprite) {
    const batchableSprite = this._gpuSpriteHash[sprite.uid];

    // this will call reset!
    BigPool.return(batchableSprite as PoolItem);

    this._gpuSpriteHash[sprite.uid] = null!;

    sprite.off('destroyed', this._destroyRenderableBound);
  }

  private _updateBatchableSprite(sprite: Sprite, batchableSprite: OsucadBatchableSprite) {
    batchableSprite.bounds = sprite.bounds;
    batchableSprite.texture = sprite._texture;

    const textureRect = sprite._texture.frame;

    const { a, b, c, d } = sprite.relativeGroupTransform;
    const scaleX = Math.sqrt((a * a) + (b * b));
    const scaleY = Math.sqrt((c * c) + (d * d));

    batchableSprite.textureRect = new Rectangle(
      textureRect.x / sprite._texture._source.width,
      textureRect.y / sprite._texture._source.height,
      textureRect.width / sprite._texture._source.width,
      textureRect.height / sprite._texture._source.height,
    );

    batchableSprite.blendRange.x = batchableSprite.textureRect.width / (sprite._texture.width * scaleX);
    batchableSprite.blendRange.y = batchableSprite.textureRect.height / (sprite._texture.height * scaleY);
  }

  private _getGpuSprite(sprite: Sprite): OsucadBatchableSprite {
    return this._gpuSpriteHash[sprite.uid] || this._initGPUSprite(sprite);
  }

  private _initGPUSprite(sprite: Sprite): OsucadBatchableSprite {
    const batchableSprite = BigPool.get(OsucadBatchableSprite);

    batchableSprite.renderable = sprite;

    batchableSprite.transform = sprite.groupTransform;
    batchableSprite.texture = sprite._texture;
    batchableSprite.bounds = sprite.bounds;
    batchableSprite.roundPixels = (this._renderer._roundPixels | sprite._roundPixels) as 0 | 1;

    const textureRect = sprite._texture.frame;

    batchableSprite.textureRect = new Rectangle(
      textureRect.x / sprite._texture._source.pixelWidth,
      textureRect.y / sprite._texture._source.pixelHeight,
      textureRect.right / sprite._texture._source.pixelWidth,
      textureRect.bottom / sprite._texture._source.pixelHeight,
    );

    batchableSprite.blendRange.x = 1 / sprite._texture.width;
    batchableSprite.blendRange.y = 1 / sprite._texture.height;

    this._gpuSpriteHash[sprite.uid] = batchableSprite;

    // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
    sprite.on('destroyed', this._destroyRenderableBound);

    return batchableSprite;
  }

  public destroy() {
    for (const i in this._gpuSpriteHash) {
      BigPool.return(this._gpuSpriteHash[i] as PoolItem);
    }

    this._gpuSpriteHash = null!;
    this._renderer = null!;
  }
}
