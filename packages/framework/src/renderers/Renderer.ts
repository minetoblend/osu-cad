import type { InjectionToken } from '../di';
import type { FrameworkEnvironment } from '../FrameworkEnvironment';
import type { Drawable } from '../graphics/drawables/Drawable';
import type { PIXIRenderer } from '../pixi';
import { extensions, Filter, GlobalUniformSystem, RenderTarget } from 'pixi.js';
import { SpriteTextPipe } from '../graphics/text/SpriteTextPipe';
import { type IVec2, Vec2 } from '../math';
import { MaskingPipe } from './MaskingPipe';
import { MaskingSystem } from './MaskingSystem';
import { OsucadBatcher } from './OsucadBatcher';
import { OsucadSpritePipe } from './OsucadSpritePipe';
import { OsucadUniformSystem } from './OsucadUniformSystem';

export interface RendererOptions {
  size: IVec2;
  environment: FrameworkEnvironment;
  rendererPreference?: 'webgl' | 'webgpu';
}

export class Renderer {
  async init(options: RendererOptions) {
    RenderTarget.defaultOptions.depth = true;
    RenderTarget.defaultOptions.stencil = true;
    Filter.defaultOptions.resolution = devicePixelRatio;

    extensions.remove(GlobalUniformSystem);
    extensions.add(
      OsucadBatcher,
      OsucadSpritePipe,
      MaskingPipe,
      MaskingSystem,
      OsucadUniformSystem,
      SpriteTextPipe,
    );

    const { autoDetectRenderer } = await import('pixi.js');
    const { size, environment } = options;

    this.#size = Vec2.from(size);

    const canvas = document.createElement('canvas');
    canvas.width = this.#size.x;
    canvas.height = this.#size.y;

    const context = canvas.getContext('webgl2', {
      alpha: false,
      antialias: environment.antialiasPreferred,
      depth: true,
      powerPreference: 'high-performance',
      desynchronized: true,
      preserveDrawingBuffer: true,
      stencil: true,
    });

    if (!context)
      throw new Error('Webgl not supported');

    this.#internalRenderer = await autoDetectRenderer({
      canvas,
      context,
      preference: 'webgl', // environment.webGpuSupported ? rendererPreference : "webgl",
      antialias: environment.antialiasPreferred,
      resolution: devicePixelRatio,
      width: this.#size.x,
      height: this.#size.y,
      autoDensity: true,
      useBackBuffer: true,
      powerPreference: 'high-performance',
      hello: false,
      clearBeforeRender: true,
      depth: true,
      eventMode: 'none',
      eventFeatures: {
        click: false,
        globalMove: false,
        move: false,
        wheel: false,
      },
    });
  }

  #internalRenderer?: PIXIRenderer;

  get internalRenderer() {
    if (!this.#internalRenderer) {
      throw new Error('Renderer not initialized');
    }
    return this.#internalRenderer;
  }

  render(drawable: Drawable) {
    this.internalRenderer.render(drawable.drawNode);
  }

  get canvas(): HTMLCanvasElement {
    return this.internalRenderer.canvas;
  }

  #size: Vec2 = Vec2.zero();

  get size(): Vec2 {
    return this.#size;
  }

  set size(value: IVec2) {
    if (this.#size.equals(value))
      return;

    this.#size = Vec2.from(value);

    this.internalRenderer.resize(this.#size.x, this.#size.y);
  }
}

export type IRenderer = PIXIRenderer;

// eslint-disable-next-line ts/no-redeclare
export const IRenderer: InjectionToken<PIXIRenderer> = Symbol('IRenderer');
