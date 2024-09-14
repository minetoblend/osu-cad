import {
  AudioManager,
  dependencyLoader,
  Game,
  IRenderer,
  isMobile,
  PIXIRenderer,
  resolved,
  ScreenStack,
} from 'osucad-framework';
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
import { EditorEnvironment } from './environment/EditorEnvironment';
import { OsucadIcons } from './OsucadIcons';
import { ISkinSource } from './skinning/ISkinSource';
import { IResourcesProvider } from './io/IResourcesProvider';
import { BeatmapStore, SkinStore } from './environment';
import { FpsOverlay } from './FpsOverlay';
import { OsucadConfigManager } from './config/OsucadConfigManager.ts';
import { SkinSwitcher } from './SkinSwitcher.ts';

RenderTarget.defaultOptions.depth = true;
RenderTarget.defaultOptions.stencil = true;

export class OsucadGame extends Game implements IResourcesProvider {
  constructor(
    readonly environment: EditorEnvironment,
  ) {
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

    await this.environment.load();

    const config = new OsucadConfigManager();
    config.load();

    this.dependencies.provide(IResourcesProvider, this);

    this.dependencies.provide(OsucadConfigManager, config);

    this.dependencies.provide(EditorEnvironment, this.environment);

    this.dependencies.provide(BeatmapStore, this.environment.beatmaps);
    this.dependencies.provide(SkinStore, this.environment.skins);

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
      new FpsOverlay({
        child:
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
      }),
    );

    const notifications = new NotificationOverlay();
    this.add(notifications);
    this.dependencies.provide(notifications);

    const skinSwitcher = new SkinSwitcher(this.environment.skins);
    await this.loadComponentAsync(skinSwitcher);
    this.add(skinSwitcher);

    this.dependencies.provide(ISkinSource, skinSwitcher);

    if (!isMobile.any) {
      this.add(new MainCursorContainer());
    }

    screenStack.push(new BeatmapSelect());
  }

  onClick(): boolean {
    return true;
  }
}

