import type { Game } from '../Game';
import type { Container } from '../graphics/containers/Container';
import type { InputHandler } from '../input';
import type { KeyBinding } from '../input/bindings/KeyBinding';
import type { IFrameBasedClock } from '../timing/IFrameBasedClock';
import {} from '@pixi/devtools';
import { AudioManager } from '../audio/AudioManager';
import { Action } from '../bindables/Action';
import { setupDevtools } from '../devtools/setupDevtools';
import { DependencyContainer } from '../di/DependencyContainer';
import { FrameworkEnvironment } from '../FrameworkEnvironment';
import { loadDrawableFromAsync } from '../graphics/drawables/Drawable';
import { GAME_HOST } from '../injectionTokens';
import { autoDetectPlatformActions } from '../input/autoDetectPlatformActions';
import { KeyboardHandler } from '../input/handlers/KeyboardHandler';
import { MouseHandler } from '../input/handlers/MouseHandler';
import { TouchHandler } from '../input/handlers/TouchHandler';
import { PlatformActionContainer } from '../input/PlatformActionContainer';
import { TextInputSource } from '../input/TextInputSource';
import { UserInputManager } from '../input/UserInputManager';
import { Vec2 } from '../math';
import { IRenderer, Renderer } from '../renderers/Renderer';
import { FrameStatistics } from '../statistics/FrameStatistics';
import { FramedClock } from '../timing/FramedClock';

export interface GameHostOptions {
  friendlyGameName?: string;
}

export abstract class GameHost {
  get renderer(): Renderer {
    if (!this.#renderer)
      throw new Error('Renderer not initialized');

    return this.#renderer;
  }

  #renderer?: Renderer;

  get audioManager(): AudioManager {
    if (!this.#audioManager)
      throw new Error('AudioManager not initialized');

    return this.#audioManager;
  }

  #audioManager?: AudioManager;

  clock!: IFrameBasedClock;

  name: string;

  readonly dependencies = new DependencyContainer();

  protected constructor(gameName: string, options: GameHostOptions = {}) {
    this.name = options.friendlyGameName ?? `osucad framework running "${gameName}"`;
  }

  protected root: Container | null = null;

  #frameCount = 0;

  executionState: ExecutionState = ExecutionState.Idle;

  abstract getWindowSize(): Vec2;

  readonly afterRender = new Action();

  update() {
    FrameStatistics.clear();

    if (!this.root)
      return;

    this.#frameCount++;

    this.renderer.size = this.getWindowSize();

    this.root.size = this.getWindowSize().componentMax(Vec2.one());

    this.clock.processFrame();

    let startTime = FrameStatistics.updateSubTree.start();
    this.root.updateSubTree();
    FrameStatistics.updateSubTree.stop(startTime);

    startTime = FrameStatistics.updateSubTreeTransforms.start();
    this.root.updateSubTreeTransforms();
    FrameStatistics.updateSubTreeTransforms.stop(startTime);
  }

  protected render() {
    FrameStatistics.draw.measure(() => this.renderer.render(this.root!));
  }

  async takeScreenshot(): Promise<Blob> {
    throw new Error('Not implemented');
  }

  container!: HTMLElement;

  async run(game: Game, container: HTMLElement = document.body) {
    if (this.executionState !== ExecutionState.Idle) {
      throw new Error('GameHost is already running');
    }

    this.container = container;

    // window.addEventListener('error', (event) => {
    //   this.onUnhandledError(event.error);
    // });
    // window.addEventListener('unhandledrejection', (event) => {
    //   this.onUnhandledRejection(event);
    // });

    this.dependencies.provide(GAME_HOST, this);

    this.#populateInputHandlers();

    await this.#chooseAndSetupRenderer();

    this.#initializeInputHandlers();

    this.#audioManager = new AudioManager();

    this.dependencies.provide(this.renderer);
    this.dependencies.provide(this.audioManager);
    this.dependencies.provide(TextInputSource, this.createTextInput());

    await this.#bootstrapSceneGraph(game);

    container.appendChild(this.renderer.canvas);

    this.executionState = ExecutionState.Running;

    setupDevtools(this.root!, this.renderer.internalRenderer);

    while (this.executionState === ExecutionState.Running) {
      const startTime = performance.now();
      this.update();
      this.render();
      FrameStatistics.frame.stop(startTime);
      this.afterRender.emit();
      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
        setTimeout(resolve, 100);
      });
    }

    this.#performExit();
  }

  onUnhandledError(error: Error) {
    console.error(error);
    return false;
  }

  onUnhandledRejection(event: PromiseRejectionEvent) {
    console.error(event.reason);
    return false;
  }

  async #chooseAndSetupRenderer() {
    const renderer = new Renderer();

    await renderer.init({
      size: this.getWindowSize(),
      environment: new FrameworkEnvironment(),
    });

    this.dependencies.provide(IRenderer, renderer.internalRenderer);

    this.#renderer = renderer;
  }

  protected createAvailableInputHandlers() {
    return [new KeyboardHandler(), new TouchHandler(), new MouseHandler()];
  }

  #populateInputHandlers() {
    this.availableInputHandlers = this.createAvailableInputHandlers();
  }

  availableInputHandlers!: InputHandler[];

  #initializeInputHandlers() {}

  async #bootstrapSceneGraph(game: Game) {
    // TODO: add root containers for input handling & safe area insets
    const root = new UserInputManager();

    root.child = new PlatformActionContainer().with({
      child: game,
    });

    root.isAlive = true;

    this.dependencies.provide(root);
    this.dependencies.provide(game);

    game.host = this;

    await loadDrawableFromAsync(root, (this.clock = new FramedClock()), this.dependencies, true);

    this.root = root;
  }

  #performExit() {
    if (this.executionState === ExecutionState.Running) {
      this.dispose();
    }
    this.executionState = ExecutionState.Stopped;
  }

  #isDisposed = false;

  get isDisposed() {
    return this.#isDisposed;
  }

  dispose(disposing: boolean = true) {
    if (this.isDisposed)
      return;

    this.root?.dispose();
  }

  get platformKeyBindings(): KeyBinding[] {
    return autoDetectPlatformActions();
  }

  createTextInput(): TextInputSource {
    return new TextInputSource();
  }
}

export enum ExecutionState {
  Idle = 0,
  Stopped = 1,
  Running = 2,
}
