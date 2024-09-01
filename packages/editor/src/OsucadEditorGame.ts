import type {
  IVec2,
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
import { Editor } from './editor/Editor';
import { EditorMixer } from './editor/EditorMixer';
import { Fit, ScalingContainer } from './editor/ScalingContainer';
import { ThemeColors } from './editor/ThemeColors';
import type { EditorContext } from './editor/context/EditorContext';
import './editor/mixins/HitObjectMixin';
import { EditorActionContainer } from './editor/EditorActionContainer';
import { PreferencesContainer } from './editor/preferences/PreferencesContainer';
import { PreferencesStore } from './preferences/PreferencesStore';
import { UIFonts } from './UIFonts';

RenderTarget.defaultOptions.depth = true;
RenderTarget.defaultOptions.stencil = true;

export class OsucadEditorGame extends Game {
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

    const preferences = new PreferencesStore();
    this.dependencies.provide(preferences);
    preferences.init();

    const mixer = new EditorMixer(this.audioManager);
    this.dependencies.provide(mixer);
    super.add(mixer);

    const samples = new UISamples(this.audioManager, mixer.userInterface);
    this.dependencies.provide(samples);

    await Promise.all([
      this.context.load(),
      samples.load(),
      UIFonts.load(),
    ]);

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

    editor.fadeInFromZero(300);
  }

  onClick(): boolean {
    return true;
  }
}
