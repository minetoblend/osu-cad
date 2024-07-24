import type {
  ScreenStack,
} from 'osucad-framework';
import {
  AudioManager,
  Game,
  dependencyLoader,
  isMobile,
  resolved,
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
import { EditorLoader } from './editor/EditorLoader';
import { OnlineEditorContext } from './editor/context/OnlineEditorContext';
import { BeatmapSelect } from './beatmapSelect/BeatmapSelect';
import { UserAvatarCache } from './UserAvatarCache';
import { GlobalSongPlayback } from './GlobalSongPlayback';
import { NotificationOverlay } from './notifications/NotificationOverlay';
import { DialogContainer } from './modals/DialogContainer';
import { PreferencesContainer } from './editor/preferences/PreferencesContainer';
import { OsucadScreenStack } from './OsucadScreenStack';
import { RootScreen } from './RootScreen';

RenderTarget.defaultOptions.depth = true;
RenderTarget.defaultOptions.stencil = true;

export class OsucadGame extends Game {
  constructor() {
    super();
  }

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

    const match = path.match(/\/edit\/(\w+)/);
    if (match) {
      const joinKey = match[1];

      screenStack.push(new EditorLoader(
        new OnlineEditorContext(joinKey),
      ));
    }
    else {
      screenStack.push(new BeatmapSelect());
    }
  }

  onClick(): boolean {
    return true;
  }
}
