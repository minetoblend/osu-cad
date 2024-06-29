import { Game, IVec2, dependencyLoader, isMobile } from 'osucad-framework';
import { Editor } from './editor/Editor';
import { Fit, ScalingContainer } from './editor/ScalingContainer';
import { EditorContext } from './editor/context/EditorContext';
import { ThemeColors } from './editor/ThemeColors';
import { UIIcons } from './editor/UIIcons';
import { UIFonts } from './editor/UIFonts';
import { UISamples } from './UISamples';
import { resolved } from 'osucad-framework';
import { AudioManager } from 'osucad-framework';
import { EditorMixer } from './editor/EditorMixer';

export class OsucadGame extends Game {
  constructor(readonly context: EditorContext) {
    super();
  }

  get resolution(): IVec2 {
    if (isMobile.any) {
      return {
        x: 640,
        y: 480,
      };
    }

    return {
      x: 960,
      y: 768,
    };
  }

  #innerContainer = new ScalingContainer({
    desiredSize: this.resolution,
    fit: Fit.Fill,
  });

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @dependencyLoader()
  async init(): Promise<void> {
    this.dependencies.provide(new ThemeColors());

    this.add(this.#innerContainer);

    const icons = new UIIcons();
    this.dependencies.provide(icons);

    const fonts = new UIFonts();
    this.dependencies.provide(fonts);

    const mixer = new EditorMixer(this.audioManager);
    this.dependencies.provide(mixer);

    const samples = new UISamples(this.audioManager, mixer.userInterface);
    this.dependencies.provide(samples);

    await Promise.all([
      this.context.load(),
      icons.load(),
      fonts.load(),
      samples.load(),
    ]);

    this.context.provideDependencies(this.dependencies);

    const editor = new Editor(this.context);
    this.#innerContainer.add(editor);

    editor.fadeIn({ duration: 300 });
  }
}
