import {
  AudioManager,
  type DependencyContainer,
  dependencyLoader,
  Game,
  IRenderer,
  type PIXIRenderer,
  resolved,
} from 'osucad-framework';
import { OsucadConfigManager } from './config/OsucadConfigManager';
import { EditorMixer } from './editor/EditorMixer';
import { ThemeColors } from './editor/ThemeColors';
import { BeatmapStore, EditorEnvironment, SkinStore } from './environment';
import { GlobalBeatmapBindable } from './GlobalBeatmapBindable';
import { IResourcesProvider } from './io/IResourcesProvider';
import { MainCursorContainer } from './MainCursorContainer';
import { OsucadIcons } from './OsucadIcons';
import { ISkinSource } from './skinning/ISkinSource';
import { SkinManager } from './skinning/SkinManager';
import { UIFonts } from './UIFonts';
import { UISamples } from './UISamples';

export class OsucadGameBase extends Game {
  constructor(
    readonly environment: EditorEnvironment,
  ) {
    super();
  }

  @resolved(IRenderer)
  renderer!: PIXIRenderer;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  config!: OsucadConfigManager;

  mixer!: EditorMixer;

  @dependencyLoader()
  async load(dependencies: DependencyContainer): Promise<void> {
    dependencies.provide(Game, this);

    const config = new OsucadConfigManager();
    config.load();

    this.config = config;

    dependencies.provide(IResourcesProvider, this);

    dependencies.provide(OsucadConfigManager, config);

    dependencies.provide(EditorEnvironment, this.environment);

    dependencies.provide(BeatmapStore, this.environment.beatmaps);
    dependencies.provide(SkinStore, this.environment.skins);

    dependencies.provide(new ThemeColors());

    const mixer = new EditorMixer(this.audioManager);
    dependencies.provide(mixer);
    super.add(mixer);

    this.mixer = mixer;

    const samples = new UISamples(this.audioManager, mixer.userInterface);
    dependencies.provide(samples);

    const beatmap = new GlobalBeatmapBindable(null);
    dependencies.provide(beatmap);

    await Promise.all([
      samples.load(),
      UIFonts.load(),
      OsucadIcons.load(),
    ]);

    const skinManager = new SkinManager(this.environment.skins);

    dependencies.provide(ISkinSource, skinManager);
    dependencies.provide(SkinManager, skinManager);

    const cursorContainer = new MainCursorContainer();
    dependencies.provide(cursorContainer);

    await this.environment.load();
  }

  onClick(): boolean {
    return true;
  }
}
