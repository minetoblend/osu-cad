import {
  Assets,
  Renderer,
  TexturePool,
  Ticker,
  autoDetectRenderer,
} from 'pixi.js';
import { DependencyContainer } from './di/DependencyContainer';
import { RENDERER } from './di/keys';
import { InputManager } from './input/InputManager';
import { Vec2 } from '@osucad/common';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable.ts';
import { AudioManager } from '@/framework/audio/AudioManager.ts';

export class AppHost {
  private _renderer?: Renderer;

  get renderer(): Renderer {
    if (!this._renderer) {
      throw new Error('Renderer not initialized');
    }
    return this._renderer;
  }

  stage = new ContainerDrawable();
  dependencies = new DependencyContainer();
  inputManager!: InputManager;
  audioManager!: AudioManager;

  async init() {
    this._renderer = await autoDetectRenderer({
      width: window.innerWidth,
      height: window.innerHeight,
      autoDensity: true,
      antialias: true,
      resolution: window.devicePixelRatio,
      useBackBuffer: true,
      powerPreference: 'high-performance',
    });

    this.inputManager = new InputManager(this);
    this.dependencies.provide(this.inputManager);

    this.audioManager = new AudioManager();
    this.dependencies.provide(this.audioManager);

    this.provideInitialDependencies();

    this.stage.size = new Vec2(window.innerWidth, window.innerHeight);
    addEventListener('resize', this._onResize);
    Ticker.shared.add(this.update, this);

    this.stage._load(this.dependencies);
  }

  private _onResize = () => {
    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.stage.size = new Vec2(window.innerWidth, window.innerHeight);
  };

  destroy() {
    this._renderer?.destroy();
    this._renderer = undefined;
    Ticker.shared.remove(this.update, this);
    TexturePool.clear();
    Assets.reset();
    document.removeEventListener('resize', this._onResize);
    this.inputManager.destroy();
  }

  update() {
    this.stage.updateSubtree();
    this.render();
  }

  render() {
    this.renderer.render(this.stage.drawNode);
  }

  protected provideInitialDependencies() {
    this.dependencies.provide(RENDERER, this.renderer);
    this.dependencies.provide(AppHost, this);
    this.dependencies.provide(Ticker, Ticker.shared);
  }

  get canvas() {
    return this.renderer.canvas;
  }
}
