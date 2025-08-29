import { type WebGLRenderer } from "pixi.js";
import type { InjectionToken } from "../di";
import type { FrameworkEnvironment } from "../FrameworkEnvironment";
import type { Drawable } from "../graphics/drawables/Drawable";
import { type IVec2, Vec2 } from "../math";

export interface RendererOptions
{
  size: IVec2;
  environment: FrameworkEnvironment;
  rendererPreference?: "webgl" | "webgpu";
}

export class Renderer
{
  public async init(options: RendererOptions)
  {
    await import("./init");

    const { WebGLRenderer } = await import("pixi.js");

    const { size, environment } = options;

    this.#size = Vec2.from(size);

    const canvas = document.createElement("canvas");
    canvas.width = this.#size.x;
    canvas.height = this.#size.y;

    const context = canvas.getContext("webgl2", {
      alpha: false,
      antialias: environment.antialiasPreferred,
      depth: true,
      powerPreference: "high-performance",
      desynchronized: true,
      preserveDrawingBuffer: true,
      stencil: true,
    });

    if (!context)
      throw new Error("Webgl not supported");

    this.#internalRenderer = new WebGLRenderer();

    await this.#internalRenderer.init({
      canvas,
      context,
      antialias: environment.antialiasPreferred,
      resolution: devicePixelRatio,
      width: this.#size.x,
      height: this.#size.y,
      autoDensity: true,
      useBackBuffer: true,
      powerPreference: "high-performance",
      hello: false,
      clearBeforeRender: true,
      depth: true,
      eventMode: "none",
      skipExtensionImports: true,
      eventFeatures: {
        click: false,
        globalMove: false,
        move: false,
        wheel: false,
      },
    });
  }

  #internalRenderer?: WebGLRenderer;

  public get internalRenderer()
  {
    if (!this.#internalRenderer)
    {
      throw new Error("Renderer not initialized");
    }
    return this.#internalRenderer;
  }

  public render(drawable: Drawable)
  {
    this.internalRenderer.render(drawable.drawNode);
  }

  public get canvas(): HTMLCanvasElement
  {
    return this.internalRenderer.canvas;
  }

  #size: Vec2 = Vec2.zero();

  public get size(): Vec2
  {
    return this.#size;
  }

  public set size(value: IVec2)
  {
    if (this.#size.equals(value))
      return;

    this.#size = Vec2.from(value);

    this.internalRenderer.resize(this.#size.x, this.#size.y);
  }
}

export type IRenderer = WebGLRenderer;

export const IRenderer: InjectionToken<WebGLRenderer> = Symbol("IRenderer");
