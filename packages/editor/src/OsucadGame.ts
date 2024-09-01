import type { PIXIRenderer, ScreenStack } from 'osucad-framework';
import { AudioManager, Game, IRenderer, dependencyLoader, isMobile, resolved } from 'osucad-framework';
import { RenderTarget } from 'pixi.js';
import { MainCursorContainer } from './MainCursorContainer';
import { UISamples } from './UISamples';
import { EditorMixer } from './editor/EditorMixer';
import { Fit, ScalingContainer } from './editor/ScalingContainer';
import { ThemeColors } from './editor/ThemeColors';
import { EditorActionContainer } from './editor/EditorActionContainer';
import { PreferencesStore } from './preferences/PreferencesStore';
import { UIFonts } from './UIFonts';
import { BeatmapSelect } from './beatmapSelect/BeatmapSelect';
import { UserAvatarCache } from './UserAvatarCache';
import { GlobalSongPlayback } from './GlobalSongPlayback';
import { NotificationOverlay } from './notifications/NotificationOverlay';
import { DialogContainer } from './modals/DialogContainer';
import { PreferencesContainer } from './editor/preferences/PreferencesContainer';
import { OsucadScreenStack } from './OsucadScreenStack';
import { RootScreen } from './RootScreen';
import { autodetectEditorEnvironment } from './environment/autodetectEditorEnvironment';
import { EditorEnvironment } from './environment/EditorEnvironment';
import { OsucadIcons } from './OsucadIcons';
import { createDefaultSkin } from './skinning/CreateDefaultSkin';
import { ISkinSource } from './skinning/ISkinSource';
import { SkinSource } from './skinning/SkinSource';
import type { IResourcesProvider } from './io/IResourcesProvider';
import { SkinStore } from './environment/SkinStore';

RenderTarget.defaultOptions.depth = true;
RenderTarget.defaultOptions.stencil = true;

export class OsucadGame extends Game implements IResourcesProvider {
  constructor() {
    super();
  }

  @resolved(IRenderer)
  renderer!: PIXIRenderer;

  #innerContainer = new ScalingContainer({
    desiredSize: {
      x: 960,
      y: 768,
    },
    fit: Fit.Fill,
  });

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @dependencyLoader()
  async init(): Promise<void> {
    this.dependencies.provide(Game, this);

    const environment = await autodetectEditorEnvironment();

    await environment.load();

    this.dependencies.provide(EditorEnvironment, environment);

    const skinStore = environment.createSkinStore();

    await skinStore.load();

    const skin = await skinStore.skins.value[0].loadSkin(this);

    const defaultSkin = await createDefaultSkin();

    this.dependencies.provide(ISkinSource, new SkinSource(skin, defaultSkin));
    this.dependencies.provide(SkinStore, skinStore);

    this.dependencies.provide(new ThemeColors());

    this.add(this.#innerContainer);

    const preferences = new PreferencesStore();
    this.dependencies.provide(preferences);
    preferences.init();

    const mixer = new EditorMixer(this.audioManager);
    this.dependencies.provide(mixer);
    super.add(mixer);

    const samples = new UISamples(this.audioManager, mixer.userInterface);
    this.dependencies.provide(samples);

    await Promise.all([
      samples.load(),
      UIFonts.load(),
      OsucadIcons.load(),
    ]);

    const songPlayback = new GlobalSongPlayback();
    this.dependencies.provide(songPlayback);
    super.add(songPlayback);

    const userAvatarCache = new UserAvatarCache();
    this.dependencies.provide(userAvatarCache);
    super.add(userAvatarCache);

    let screenStack: ScreenStack;

    this.#innerContainer.add(
      new EditorActionContainer({
        child: new DialogContainer({
          child: new PreferencesContainer({
            child: screenStack = new OsucadScreenStack(
              new RootScreen(),
              true,
            ),
          }),
        }),
      }),
    );

    const notifications = new NotificationOverlay();
    this.add(notifications);
    this.dependencies.provide(notifications);

    const path = window.location.pathname;

    if (!isMobile.any) {
      this.add(new MainCursorContainer());
    }

    // const match = path.match(/\/edit\/(\w+)/);
    // if (match) {
    //   const joinKey = match[1];
    //
    //   screenStack.push(new EditorLoader(
    //     new OnlineEditorContext(joinKey),
    //   ));
    // }
    // else {
    screenStack.push(new BeatmapSelect());
    // }
  }

  onClick(): boolean {
    return true;
  }
}
