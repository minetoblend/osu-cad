import type { BitmapText, Container, InstructionSet, PoolItem, Renderable, Renderer, RenderPipe } from "pixi.js";
import { BigPool, BitmapFontManager, Cache, ExtensionType, getBitmapTextLayout, getMaxTexturesPerBatch, Graphics, SdfShader } from "pixi.js";
import { TextShader } from "./TextShader";

export class SpriteTextPipe implements RenderPipe<BitmapText>
{
  /** @ignore */
  public static extension = {
    type: [
      ExtensionType.WebGLPipes,
      ExtensionType.WebGPUPipes,
      ExtensionType.CanvasPipes,
    ],
    name: "spriteText",
  } as const;

  private _renderer: Renderer;
  private _gpuBitmapText: Record<number, Graphics> = {};
  private readonly _destroyRenderableBound = this.destroyRenderable.bind(this) as (renderable: Container) => void;
  private readonly _textShader: TextShader;

  constructor(renderer: Renderer)
  {
    this._renderer = renderer;
    this._renderer.renderableGC.addManagedHash(this, "_gpuBitmapText");

    const maxTextures = getMaxTexturesPerBatch();
    this._textShader = new TextShader(maxTextures);
  }

  public validateRenderable(bitmapText: BitmapText): boolean
  {
    const graphicsRenderable = this._getGpuBitmapText(bitmapText);

    if (bitmapText._didTextUpdate)
    {
      bitmapText._didTextUpdate = false;

      this._updateContext(bitmapText, graphicsRenderable);
    }

    return this._renderer.renderPipes.graphics.validateRenderable(graphicsRenderable);

    // TODO - need to shift all the verts in the graphicsData to the new anchor

    // update the anchor...
  }

  public addRenderable(bitmapText: BitmapText, instructionSet: InstructionSet)
  {
    const graphicsRenderable = this._getGpuBitmapText(bitmapText);

    // sync..
    syncWithProxy(bitmapText, graphicsRenderable);

    if (bitmapText._didTextUpdate)
    {
      bitmapText._didTextUpdate = false;

      this._updateContext(bitmapText, graphicsRenderable);
    }

    this._renderer.renderPipes.graphics.addRenderable(graphicsRenderable, instructionSet);

    if (graphicsRenderable.context.customShader instanceof SdfShader)
    {
      this._updateDistanceField(bitmapText);
    }
  }

  public destroyRenderable(bitmapText: BitmapText)
  {
    bitmapText.off("destroyed", this._destroyRenderableBound);

    this._destroyRenderableByUid(bitmapText.uid);
  }

  private _destroyRenderableByUid(renderableUid: number)
  {
    const context = this._gpuBitmapText[renderableUid].context;

    if (context.customShader instanceof SdfShader)
    {
      BigPool.return(context.customShader as PoolItem);

      context.customShader = null!;
    }

    BigPool.return(this._gpuBitmapText[renderableUid] as PoolItem);
    this._gpuBitmapText[renderableUid] = null!;
  }

  public updateRenderable(bitmapText: BitmapText)
  {
    const graphicsRenderable = this._getGpuBitmapText(bitmapText);

    // sync..
    syncWithProxy(bitmapText, graphicsRenderable);

    this._renderer.renderPipes.graphics.updateRenderable(graphicsRenderable);

    if (graphicsRenderable.context.customShader instanceof SdfShader)
    {
      this._updateDistanceField(bitmapText);
    }
  }

  private _updateContext(bitmapText: BitmapText, proxyGraphics: Graphics)
  {
    const { context } = proxyGraphics;

    const bitmapFont = BitmapFontManager.getFont(bitmapText.text, bitmapText._style);

    context.clear();

    if (bitmapFont.distanceField!.type !== "none")
    {
      if (!context.customShader)
      {
        context.customShader = BigPool.get(SdfShader);
      }
    }
    else
    {
      context.customShader = this._textShader;
    }

    const chars = Array.from(bitmapText.text);
    const style = bitmapText._style;

    let currentY = bitmapFont.baseLineOffset;

    // measure our text...
    const bitmapTextLayout = getBitmapTextLayout(chars, style, bitmapFont, true);

    let index = 0;

    const padding = style.padding;
    const scale = bitmapTextLayout.scale;

    let tx = bitmapTextLayout.width;
    let ty = bitmapTextLayout.height + bitmapTextLayout.offsetY;

    if (style._stroke)
    {
      tx += style._stroke.width / scale;
      ty += style._stroke.width / scale;
    }

    context
      .translate((-bitmapText._anchor._x * tx) - padding, (-bitmapText._anchor._y * ty) - padding)
      .scale(scale, scale);

    const tint = bitmapFont.applyFillAsTint ? style._fill.color : 0xFFFFFF;

    for (let i = 0; i < bitmapTextLayout.lines.length; i++)
    {
      const line = bitmapTextLayout.lines[i];

      for (let j = 0; j < line.charPositions.length; j++)
      {
        const char = chars[index++];

        const charData = bitmapFont.chars[char];

        if (charData?.texture)
        {
          context.texture(
              charData.texture,
              tint || "black",
              Math.round(line.charPositions[j] + charData.xOffset),
              Math.round(currentY + charData.yOffset),
          );
        }
      }

      currentY += bitmapFont.lineHeight;
    }
  }

  private _getGpuBitmapText(bitmapText: BitmapText)
  {
    return this._gpuBitmapText[bitmapText.uid] || this.initGpuText(bitmapText);
  }

  public initGpuText(bitmapText: BitmapText)
  {
    // TODO we could keep a bunch of contexts around and reuse one that has the same style!
    const proxyRenderable = BigPool.get(Graphics);

    this._gpuBitmapText[bitmapText.uid] = proxyRenderable;

    this._updateContext(bitmapText, proxyRenderable);

    bitmapText.on("destroyed", this._destroyRenderableBound);

    return this._gpuBitmapText[bitmapText.uid];
  }

  private _updateDistanceField(bitmapText: BitmapText)
  {
    const context = this._getGpuBitmapText(bitmapText).context;

    const fontFamily = bitmapText._style.fontFamily as string;
    const dynamicFont = Cache.get(`${fontFamily as string}-bitmap`);

    // Inject the shader code with the correct value
    const { a, b, c, d } = bitmapText.groupTransform;

    const dx = Math.sqrt((a * a) + (b * b));
    const dy = Math.sqrt((c * c) + (d * d));
    const worldScale = (Math.abs(dx) + Math.abs(dy)) / 2;

    const fontScale = dynamicFont.baseRenderedFontSize / bitmapText._style.fontSize;

    const distance = worldScale * dynamicFont.distanceField.range * (1 / fontScale);

    context.customShader!.resources.localUniforms.uniforms.uDistance = distance;
  }

  public destroy()
  {
    for (const uid in this._gpuBitmapText)
    {
      this._destroyRenderableByUid(uid as unknown as number);
    }

    this._gpuBitmapText = null!;

    this._renderer = null!;
  }
}

function syncWithProxy(container: Renderable, proxy: Renderable)
{
  proxy.groupTransform = container.groupTransform;
  proxy.groupColorAlpha = container.groupColorAlpha;
  proxy.groupColor = container.groupColor;
  proxy.groupBlendMode = container.groupBlendMode;
  proxy.globalDisplayStatus = container.globalDisplayStatus;
  proxy.groupTransform = container.groupTransform;
  proxy.localDisplayStatus = container.localDisplayStatus;
  proxy.groupAlpha = container.groupAlpha;
  proxy._roundPixels = container._roundPixels;
}
