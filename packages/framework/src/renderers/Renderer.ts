import type { InjectionToken } from '../di';
import type { FrameworkEnvironment } from '../FrameworkEnvironment';
import type { Drawable } from '../graphics/drawables/Drawable';
import type { PIXIRenderer } from '../pixi';
import { extensions, GlobalUniformSystem } from 'pixi.js';
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
    extensions.remove(GlobalUniformSystem);
    extensions.add(
      OsucadBatcher,
      OsucadSpritePipe,
      MaskingPipe,
      MaskingSystem,
      OsucadUniformSystem,
    );

    const { autoDetectRenderer } = await import('pixi.js');
    const { size, environment } = options;

    this.#size = Vec2.from(size);

    const canvas = document.createElement('canvas');
    canvas.width = this.#size.x;
    canvas.height = this.#size.y;

    const context = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: true,
      powerPreference: 'high-performance',
      desynchronized: true,
      preserveDrawingBuffer: true,
      stencil: true,
    });

    this.#internalRenderer = await autoDetectRenderer({
      canvas,
      context,
      preference: 'webgl', // environment.webGpuSupported ? rendererPreference : "webgl",
      antialias: false,
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
