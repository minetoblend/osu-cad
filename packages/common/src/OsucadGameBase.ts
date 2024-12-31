import type { Container, Drawable, PIXIRenderer, ReadonlyDependencyContainer } from 'osucad-framework';
import { EditorActionContainer } from '@osucad/editor/editor/EditorActionContainer';
import { Fit, ScalingContainer } from '@osucad/editor/editor/ScalingContainer';
import { NotificationOverlay } from '@osucad/editor/notifications/NotificationOverlay';
import { AudioManager, Axes, Box, DependencyContainer, Game, IRenderer, provide, resolved } from 'osucad-framework';
import { AudioMixer } from './audio/AudioMixer';
import { OsucadConfigManager } from './config/OsucadConfigManager';
import { UIFonts } from './drawables/UIFonts';
import { IResourcesProvider } from './io/IResourcesProvider';
import { OsucadIcons } from './OsucadIcons';
import { ContextMenuContainer } from './userInterface/ContextMenuContainer';

@provide(IResourcesProvider)
export abstract class OsucadGameBase extends Game implements IResourcesProvider {
  @resolved(IRenderer)
  renderer!: PIXIRenderer;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  mixer!: AudioMixer;

  config!: OsucadConfigManager;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.mixer = new AudioMixer(this.audioManager);
    this.#dependencies.provide(AudioMixer, this.mixer);

    this.config = new OsucadConfigManager();

    this.#dependencies.provide(OsucadConfigManager, this.config);

    super.content.addAll(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x000000,
        depth: 1,
      }),
      new ScalingContainer({
        desiredSize: {
          x: 960,
          y: 768,
        },
        fit: Fit.Fill,
        child: new EditorActionContainer({
          child: this.#content = new ContextMenuContainer({

          }),
        }),
      }),
    );

    const notificationOverlay = new NotificationOverlay();
    super.content.add(notificationOverlay);
    this.#dependencies.provide(NotificationOverlay, notificationOverlay);

    this.addParallelLoad(OsucadIcons.load());
    this.addParallelLoad(this.#loadFonts());
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
