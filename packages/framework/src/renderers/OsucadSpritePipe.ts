import type { Container, InstructionSet, PoolItem, Renderer, RenderPipe } from "pixi.js";
import type { SpriteDrawNode } from "../graphics/drawables/SpriteDrawNode";
import { BigPool, ExtensionType } from "pixi.js";
import { OsucadBatchableSprite } from "./OsucadBatchableSprite";

export class OsucadSpritePipe implements RenderPipe<SpriteDrawNode>
{
  /** @ignore */
  public static extension = {
    type: [
      ExtensionType.WebGLPipes,
      ExtensionType.WebGPUPipes,
      ExtensionType.CanvasPipes,
    ],
    name: "osucad-sprite",
  } as const;

  private _renderer: Renderer;
  private _gpuSpriteHash: Record<number, OsucadBatchableSprite> = Object.create(null);
  private readonly _destroyRenderableBound = this.destroyRenderable.bind(this) as (renderable: Container<any>) => void;

  constructor(renderer: Renderer)
  {
    this._renderer = renderer;
    this._renderer.renderableGC.addManagedHash(this, "_gpuSpriteHash");
  }

  public addRenderable(sprite: SpriteDrawNode, instructionSet: InstructionSet)
  {
    const gpuSprite = this._getGpuSprite(sprite);

    if (sprite.didViewUpdate)
      this._updateBatchableSprite(sprite, gpuSprite);

    // TODO visibility
    this._renderer.renderPipes.batch.addToBatch(gpuSprite, instructionSet);
  }

  public updateRenderable(sprite: SpriteDrawNode)
  {
    const gpuSprite = this._gpuSpriteHash[sprite.uid];

    if (sprite.didViewUpdate)
      this._updateBatchableSprite(sprite, gpuSprite);

    gpuSprite._batcher.updateElement(gpuSprite);
  }

  public validateRenderable(sprite: SpriteDrawNode): boolean
  {
    const texture = sprite._texture;
    const gpuSprite = this._getGpuSprite(sprite);

    if (gpuSprite.texture._source !== texture._source)
    {
      return !gpuSprite._batcher.checkAndUpdateTexture(gpuSprite, texture);
    }

    return false;
  }

  public destroyRenderable(sprite: SpriteDrawNode)
  {
    const batchableSprite = this._gpuSpriteHash[sprite.uid];

    // this will call reset!
    BigPool.return(batchableSprite as PoolItem);

    this._gpuSpriteHash[sprite.uid] = null!;

    sprite.off("destroyed", this._destroyRenderableBound);
  }

  private _updateBatchableSprite(sprite: SpriteDrawNode, batchableSprite: OsucadBatchableSprite)
  {
    batchableSprite.bounds = sprite.visualBounds;
    batchableSprite.texture = sprite._texture;
  }

  private _getGpuSprite(sprite: SpriteDrawNode): OsucadBatchableSprite
  {
    return this._gpuSpriteHash[sprite.uid] || this._initGPUSprite(sprite);
  }

  private _initGPUSprite(sprite: SpriteDrawNode): OsucadBatchableSprite
  {
    const batchableSprite = BigPool.get(OsucadBatchableSprite);

    batchableSprite.renderable = sprite;

    batchableSprite.transform = sprite.groupTransform;
    batchableSprite.texture = sprite._texture;
    batchableSprite.bounds = sprite.visualBounds;
    batchableSprite.roundPixels = (this._renderer._roundPixels | sprite._roundPixels) as 0 | 1;

    this._gpuSpriteHash[sprite.uid] = batchableSprite;

    // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
    sprite.on("destroyed", this._destroyRenderableBound);

    return batchableSprite;
  }

  public destroy()
  {
    for (const i in this._gpuSpriteHash)
    {
      BigPool.return(this._gpuSpriteHash[i] as PoolItem);
    }

    this._gpuSpriteHash = null!;
    this._renderer = null!;
  }
}
