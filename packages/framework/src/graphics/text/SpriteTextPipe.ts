import type {
  BitmapText,
  GPUData,
  InstructionSet,
  Renderable,
  Renderer,
  RenderPipe } from "pixi.js";
import { CanvasTextMetrics,
  PoolItem,
} from "pixi.js";
import {
  Container, GCManagedHash,
} from "pixi.js";
import { BigPool, BitmapFontManager, Cache, ExtensionType, getBitmapTextLayout, getMaxTexturesPerBatch, Graphics, SdfShader } from "pixi.js";
import { TextShader } from "./TextShader";


export class BitmapTextGraphics extends Graphics implements GPUData
{
  public override destroy()
  {
    if (this.context.customShader)
    {
      this.context.customShader.destroy();
    }

    super.destroy();
  }
}

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

  protected _renderer: Renderer;
  private readonly _managedBitmapTexts: GCManagedHash<BitmapText>;

  constructor(renderer: Renderer)
  {
    this._renderer = renderer;
    this._managedBitmapTexts = new GCManagedHash({ renderer, type: "renderable", priority: -2, name: "bitmapText" });
  }

  public validateRenderable(bitmapText: BitmapText): boolean
  {
    const graphicsRenderable = this._getGpuBitmapText(bitmapText);

    return this._renderer.renderPipes.graphics.validateRenderable(graphicsRenderable);
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

    if (graphicsRenderable.context.customShader)
    {
      this._updateDistanceField(bitmapText);
    }
  }
  public updateRenderable(bitmapText: BitmapText)
  {
    const graphicsRenderable = this._getGpuBitmapText(bitmapText);

    // sync..
    syncWithProxy(bitmapText, graphicsRenderable);

    this._renderer.renderPipes.graphics.updateRenderable(graphicsRenderable);

    if (graphicsRenderable.context.customShader)
    {
      this._updateDistanceField(bitmapText);
    }
  }

  protected getSdfShader(): SdfShader
  {
    return new SdfShader(this._renderer.limits.maxTextures);
  }

  private _updateContext(bitmapText: BitmapText, proxyGraphics: Graphics)
  {
    const { context } = proxyGraphics;

    const bitmapFont = BitmapFontManager.getFont(bitmapText.text, bitmapText._style);

    context.clear();

    if (bitmapFont.distanceField?.type !== "none")
    {
      // Only use custom shader for WebGL/WebGPU renderers
      // Canvas renderer cannot properly handle MSDF distance field math
      const sdfShader = this.getSdfShader();

      if (sdfShader)
      {
        if (!context.customShader)
        {
          context.customShader = sdfShader;
        }
      }
    }

    const chars = CanvasTextMetrics.graphemeSegmenter(bitmapText.text);
    const style = bitmapText._style;

    let currentY = bitmapFont.baseLineOffset;

    // measure our text...
    const bitmapTextLayout = getBitmapTextLayout(chars, style, bitmapFont, true);

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

    let fontSize = bitmapFont.fontMetrics.fontSize;
    let lineHeight = bitmapFont.lineHeight;

    if (style.lineHeight)
    {
      fontSize = style.fontSize / scale;
      lineHeight = style.lineHeight / scale;
    }

    let linePositionYShift = (lineHeight - fontSize) / 2;

    // if `currentY` is no longer starts from `baseLineOffset`
    // the `baseLineOffset` below may also need to be removed
    if (linePositionYShift - bitmapFont.baseLineOffset < 0)
    {
      linePositionYShift = 0;
    }

    for (let i = 0; i < bitmapTextLayout.lines.length; i++)
    {
      const line = bitmapTextLayout.lines[i];

      for (let j = 0; j < line.charPositions.length; j++)
      {
        const char = line.chars[j];
        const charData = bitmapFont.chars[char];

        if (charData?.texture)
        {
          const texture = charData.texture;

          context.texture(
              texture,
              tint,
              Math.round(line.charPositions[j] + charData.xOffset),
              Math.round(currentY + charData.yOffset + linePositionYShift),
              texture.orig.width,
              texture.orig.height,
          );
        }
      }

      currentY += lineHeight;
    }

  }

  private _getGpuBitmapText(bitmapText: BitmapText)
  {
    return bitmapText._gpuData[this._renderer.uid] || this.initGpuText(bitmapText);
  }

  public initGpuText(bitmapText: BitmapText)
  {
    // TODO we could keep a bunch of contexts around and reuse one that has the same style!
    const proxyRenderable = new BitmapTextGraphics();

    bitmapText._gpuData[this._renderer.uid] = proxyRenderable;

    this._updateContext(bitmapText, proxyRenderable);

    this._managedBitmapTexts.add(bitmapText);

    return proxyRenderable;
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
    this._managedBitmapTexts.destroy();
    this._renderer = null!;
    (this._managedBitmapTexts as unknown) = null!;
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
