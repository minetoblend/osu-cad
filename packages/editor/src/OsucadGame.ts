import type { PIXIRenderer } from 'osucad-framework';
import { Action, AudioManager, dependencyLoader, Game, IRenderer, isMobile, resolved } from 'osucad-framework';
import { RenderTarget } from 'pixi.js';
import { BeatmapSelect } from './beatmapSelect/BeatmapSelect';
import { OsucadConfigManager } from './config/OsucadConfigManager';
import { EditorActionContainer } from './editor/EditorActionContainer';
import { EditorMixer } from './editor/EditorMixer';
import { PreferencesContainer } from './editor/preferences/PreferencesContainer';
import { Fit, ScalingContainer } from './editor/ScalingContainer';
import { ThemeColors } from './editor/ThemeColors';
import { BeatmapStore, SkinStore } from './environment';
import { EditorEnvironment } from './environment/EditorEnvironment';
import { FpsOverlay } from './FpsOverlay';
import { GlobalBeatmapBindable } from './GlobalBeatmapBindable.ts';
import { GlobalSongPlayback } from './GlobalSongPlayback';
import { IntroSequence } from './introSequence/IntroSequence';
import { IResourcesProvider } from './io/IResourcesProvider';
import { MainCursorContainer } from './MainCursorContainer';
import { DialogContainer } from './modals/DialogContainer';
import { NotificationOverlay } from './notifications/NotificationOverlay';
import { OsucadIcons } from './OsucadIcons';
import { OsucadScreenStack } from './OsucadScreenStack';
import { ISkinSource } from './skinning/ISkinSource';
import { SkinSwitcher } from './SkinSwitcher';
import { UIFonts } from './UIFonts';
import { UISamples } from './UISamples';
import { UserAvatarCache } from './UserAvatarCache';

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

  config!: OsucadConfigManager;

  mixer!: EditorMixer;

  fullyLoaded = new Action();

  @dependencyLoader()
  async init(): Promise<void> {
    this.dependencies.provide(Game, this);

    const config = new OsucadConfigManager();
    config.load();

    this.config = config;

    this.dependencies.provide(IResourcesProvider, this);

    this.dependencies.provide(OsucadConfigManager, config);

    this.dependencies.provide(EditorEnvironment, this.environment);

    this.dependencies.provide(BeatmapStore, this.environment.beatmaps);
    this.dependencies.provide(SkinStore, this.environment.skins);

    this.dependencies.provide(new ThemeColors());

    this.add(this.#innerContainer);

    const mixer = new EditorMixer(this.audioManager);
    this.dependencies.provide(mixer);
    super.add(mixer);

    this.mixer = mixer;

    const samples = new UISamples(this.audioManager, mixer.userInterface);
    this.dependencies.provide(samples);

    const beatmap = new GlobalBeatmapBindable(null);
    this.dependencies.provide(beatmap);

    let intro: IntroSequence;

    await Promise.all([
      samples.load(),
      UIFonts.load(),
      OsucadIcons.load(),
    ]);

    const skinSwitcher = new SkinSwitcher(this.environment.skins);

    this.dependencies.provide(ISkinSource, skinSwitcher);
    this.dependencies.provide(SkinSwitcher, skinSwitcher);

    this.#innerContainer.add(
      new FpsOverlay({
        child:
          new EditorActionContainer({
            child: new DialogContainer({
              child: new PreferencesContainer({
                child: new OsucadScreenStack(
                  intro = new IntroSequence(),
                  true,
                ),
              }),
            }),
          }),
      }),
    );

    await this.environment.load();

    const songPlayback = new GlobalSongPlayback();
    this.dependencies.provide(songPlayback);
    super.add(songPlayback);

    const userAvatarCache = new UserAvatarCache();
    this.dependencies.provide(userAvatarCache);
    super.add(userAvatarCache);

    const notifications = new NotificationOverlay();
    this.add(notifications);
    this.dependencies.provide(notifications);

    const beatmapSelect = new BeatmapSelect();

    await Promise.all([
      this.loadComponentAsync(skinSwitcher),
    ]);

    this.add(skinSwitcher);

    if (!isMobile.any) {
      this.add(new MainCursorContainer());
    }

    intro.nextScreenLoaded(beatmapSelect);

    this.fullyLoaded.emit();
  }

  onClick(): boolean {
    return true;
  }
}
