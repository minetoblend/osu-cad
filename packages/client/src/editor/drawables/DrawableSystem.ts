import {Container, ExtensionMetadata, extensions, ExtensionType, Renderer, System} from "pixi.js";
import {Drawable, isDrawable} from "./Drawable.ts";

export const frameStats = reactive({
  fps: 0,
  frameTime: 0,
  frameStart: 0,
});

export class DrawableSystem implements System {
  static extension: ExtensionMetadata = {
    type: [
      ExtensionType.WebGLSystem,
      ExtensionType.WebGPUSystem,
    ],
    name: "drawable",
  };

  private _renderer: Renderer;

  constructor(renderer: Renderer) {
    this._renderer = renderer;
  }

  init() {
    this._renderer.runners.prerender.add(this);
    this._renderer.runners.postrender.add(this);
  }

  destroy() {
    this._renderer.runners.prerender.remove(this);
    this._renderer.runners.postrender.remove(this);
  }

  private _renderStart = 0;
  private _lastFrame = 0;


  public prerender(): void {
    this._renderStart = performance.now();
    const timeSinceLastFrame = this._renderStart - this._lastFrame;
    frameStats.frameStart = this._renderStart;
    frameStats.fps = Math.round(1000 / timeSinceLastFrame);

    this._lastFrame = this._renderStart;
    if (this._renderer.lastObjectRendered) {
      this.loadChildren(this._renderer.lastObjectRendered);
      this.updateSubtree(this._renderer.lastObjectRendered);
    }
  }

  public postrender() {
    const duration = performance.now() - this._renderStart;
    frameStats.frameTime = duration;
  }

  private loadChildren(view: Container, parent?: Drawable) {
    if (isDrawable(view)) {
      if (!view.needsLoad) return;
      if (!view.isLoaded) {
        this.loadView(view, parent);
      }

      view.needsLoad = false;
      parent = view;

    }

    for (const child of view.children) {
      this.loadChildren(child, parent);
    }
  }

  private loadView(view: Drawable, parent?: Drawable) {
    try {
      view.load(parent);
    } catch (e) {
      console.error("Error loading drawable", view, e);
    }
  }

  private updateSubtree(view: Container, parent?: Drawable) {
    if (isDrawable(view)) {
      if (!view.isLoaded) {
        if (parent?.isLoaded)
          this.loadView(view, parent);
        else
          return;
      }
      view.onTick?.();
      if (!view.updateChildDrawables) return;
    }
    for (const child of view.children) {
      this.updateSubtree(child, parent);
    }
  }
}

extensions.add(DrawableSystem);