import type { Container, Drawable, PIXIRenderer, ReadonlyDependencyContainer } from '@osucad/framework';
import { AudioManager, Axes, Box, DependencyContainer, Game, IRenderer, isMobile, provide, resolved, Vec2 } from '@osucad/framework';
import { OsucadIcons } from '@osucad/resources';
import { AudioMixer } from './audio/AudioMixer';
import { OsucadConfigManager } from './config/OsucadConfigManager';
import { SafeAreaContainer } from './drawables/SafeAreaContainer';
import { Fit, ScalingContainer } from './drawables/ScalingContainer';
import { TooltipContainer } from './drawables/TooltipContainer';
import { UIFonts } from './drawables/UIFonts';
import { VirtualKeyboardSafeAreaContainer } from './drawables/VirtualKeyboardSafeAreaContainer';
import { EditorActionContainer } from './editor/EditorActionContainer';
import { GlobalCursorDisplay } from './graphics/cursor/GlobalCursorDisplay';
import { IResourcesProvider } from './io/IResourcesProvider';
import { PerformanceOverlay } from './overlays/PerformanceOverlay';
import { ColorProvider } from './userInterface/ColorProvider';
import { ContextMenuContainer } from './userInterface/ContextMenuContainer';

@provide(IResourcesProvider)
export abstract class OsucadGameBase extends Game implements IResourcesProvider {
  constructor() {
    super();
  }

  @resolved(IRenderer)
  renderer!: PIXIRenderer;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  mixer!: AudioMixer;

  config!: OsucadConfigManager;

  @provide(ColorProvider)
  colors = new ColorProvider();

  protected getTargetDrawSize() {
    if (isMobile.phone)
      return new Vec2(540, 440);

    if (isMobile.any)
      return new Vec2(640, 640);

    return new Vec2(960, 768);
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.config = new OsucadConfigManager();

    this.#dependencies.provide(OsucadConfigManager, this.config);

    this.mixer = new AudioMixer(this.audioManager);

    this.#dependencies.provide(AudioMixer, this.mixer);

    super.content.addRange([
      this.mixer,
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x000000,
        depth: 1,
      }),
      new SafeAreaContainer({
        child: new ScalingContainer({
          desiredSize: this.getTargetDrawSize(),
          fit: Fit.Fill,
          child: new PerformanceOverlay({
            child: new TooltipContainer({
              child: new EditorActionContainer({
                child: new VirtualKeyboardSafeAreaContainer({
                  child: this.#content = new ContextMenuContainer(),
                }),
              }),
            }),
          }),
        }),
      }),
    ]);

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

    super.content.add(new GlobalCursorDisplay().with({
      depth: -Number.MAX_VALUE,
    }));
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
