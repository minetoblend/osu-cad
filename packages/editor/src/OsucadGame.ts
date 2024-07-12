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
import { EditorContext } from './editor/context/EditorContext';
import './editor/mixins/HitObjectMixin';
import { EditorActionContainer } from './editor/EditorActionContainer';
import { PreferencesContainer } from './editor/preferences/PreferencesContainer';

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

    const mixer = new EditorMixer(this.audioManager);
    this.dependencies.provide(mixer);

    const samples = new UISamples(this.audioManager, mixer.userInterface);
    this.dependencies.provide(samples);

    mixer.userInterface.volume = 0.25;

    await Promise.all([this.context.load(), samples.load()]);

    this.context.provideDependencies(this.dependencies);

    let editor: Editor;
    this.#innerContainer.add(
      new EditorActionContainer({
        child: new PreferencesContainer({
          child: (editor = new Editor(this.context)),
        }),
      }),
    );

    if (!isMobile.any) {
      this.add(new MainCursorContainer());
    }

    editor.fadeIn({ duration: 300 });
  }

  onClick(e: ClickEvent): boolean {
    return true;
  }
}
