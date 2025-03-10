import { AudioMixer, IResourcesProvider, ISkinSource, OsucadConfigManager, SkinManager } from '@osucad/common';
import { AudioManager, type DependencyContainer, Game, IRenderer, type PIXIRenderer, resolved } from 'osucad-framework';
import { ThemeColors } from './editor/ThemeColors';
import { BeatmapStore, EditorEnvironment, SkinStore } from './environment';
import { GlobalBeatmapBindable } from './GlobalBeatmapBindable';
import { LongPressOverlay } from './LongPressOverlay';
import { MainCursorContainer } from './MainCursorContainer';
import { OsucadIcons } from './OsucadIcons';
import { OsucadSkinManager } from './skinning/OsucadSkinManager';
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

  mixer!: AudioMixer;

  override async load(dependencies: DependencyContainer) {
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

    const mixer = new AudioMixer(this.audioManager);
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

    const skinManager = new OsucadSkinManager(this.environment.skins);

    dependencies.provide(ISkinSource, skinManager);
    dependencies.provide(SkinManager, skinManager);
    dependencies.provide(OsucadSkinManager, skinManager);

    const cursorContainer = new MainCursorContainer();
    dependencies.provide(cursorContainer);

    await Promise.all([
      this.environment.load(),
      this.loadComponentAsync(skinManager),
    ]);
  }

  onClick(): boolean {
    return true;
  }

  protected loadComplete() {
    super.loadComplete();

    super.add(new LongPressOverlay().with({
      depth: -1,
    }));
  }
}
