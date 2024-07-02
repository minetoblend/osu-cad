import {
  AudioManager,
  ClickEvent,
  Game,
  IVec2,
  dependencyLoader,
  isMobile,
  resolved,
} from 'osucad-framework';
import { RenderTarget } from 'pixi.js';
import { MainCursorContainer } from './MainCursorContainer';
import { UISamples } from './UISamples';
import { Editor } from './editor/Editor';
import { EditorMixer } from './editor/EditorMixer';
import { Fit, ScalingContainer } from './editor/ScalingContainer';
import { ThemeColors } from './editor/ThemeColors';
import { UIFonts } from './editor/UIFonts';
import { UIIcons } from './editor/UIIcons';
import { EditorContext } from './editor/context/EditorContext';
import './editor/mixins/HitObjectMixin';

RenderTarget.defaultOptions.depth = true;
RenderTarget.defaultOptions.stencil = true;

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
    if (!isMobile.any) {
      this.add(new MainCursorContainer());
    }

    editor.fadeIn({ duration: 300 });
  }

  onClick(e: ClickEvent): boolean {
    return true;
  }
}
