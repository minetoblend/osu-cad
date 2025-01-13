import type { Container, Drawable, PIXIRenderer, ReadonlyDependencyContainer } from 'osucad-framework';
import { OsucadIcons } from '@osucad/resources';
import { AudioManager, Axes, Box, DependencyContainer, Game, IRenderer, provide, resolved } from 'osucad-framework';
import { RenderTarget } from 'pixi.js';
import { AudioMixer } from './audio/AudioMixer';
import { OsucadConfigManager } from './config/OsucadConfigManager';
import { SafeAreaContainer } from './drawables/SafeAreaContainer';
import { Fit, ScalingContainer } from './drawables/ScalingContainer';
import { UIFonts } from './drawables/UIFonts';
import { VirtualKeyboardSafeAreaContainer } from './drawables/VirtualKeyboardSafeAreaContainer';
import { EditorActionContainer } from './editor/EditorActionContainer';
import { GlobalCursorDisplay } from './graphics/cursor/GlobalCursorDisplay';
import { IResourcesProvider } from './io/IResourcesProvider';
import { PerformanceOverlay } from './overlays/PerformanceOverlay';
import { PreferencesContainer } from './overlays/preferences/PreferencesContainer';
import { ContextMenuContainer } from './userInterface/ContextMenuContainer';

@provide(IResourcesProvider)
export abstract class OsucadGameBase extends Game implements IResourcesProvider {
  constructor() {
    super();

    RenderTarget.defaultOptions.depth = true;
    RenderTarget.defaultOptions.stencil = true;
  }

  @resolved(IRenderer)
  renderer!: PIXIRenderer;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  mixer!: AudioMixer;

  config!: OsucadConfigManager;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.config = new OsucadConfigManager();

    this.#dependencies.provide(OsucadConfigManager, this.config);

    this.mixer = new AudioMixer(this.audioManager);

    this.#dependencies.provide(AudioMixer, this.mixer);

    super.content.addAll(
      this.mixer,
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x000000,
        depth: 1,
      }),
      new SafeAreaContainer({
        child: new ScalingContainer({
          desiredSize: {
            x: 960,
            y: 768,
          },
          fit: Fit.Fill,
          child: new PerformanceOverlay({
            child: new EditorActionContainer({
              child: new VirtualKeyboardSafeAreaContainer({
                child: new ContextMenuContainer({
                  child: this.#content = new PreferencesContainer(),
                }),
              }),
            }),
          }),
        }),
      }),
    );

    this.addParallelLoad(OsucadIcons.load());
    this.addParallelLoad(this.#loadFonts());

    this.#dependencies.provide(AudioMixer, this.mixer);
  }

  async #loadFonts() {
    await UIFonts.load();
    this.fontsLoaded();
  }

  protected fontsLoaded() {}

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = new DependencyContainer(parentDependencies);
  }

  #content!: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }

  protected override get hasAsyncLoader(): boolean {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

    await Promise.all(this.#parallelLoadPromises);

    super.content.add(new GlobalCursorDisplay());
  }

  readonly #parallelLoadPromises: Promise<any>[] = [];

  protected addParallelLoad(fnOrPromise: Promise<any> | (() => Promise<any>)) {
    this.#parallelLoadPromises.push(
      typeof fnOrPromise === 'function'
        ? fnOrPromise()
        : fnOrPromise,
    );
  }
}
