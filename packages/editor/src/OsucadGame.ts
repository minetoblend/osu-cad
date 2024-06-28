import { Game, dependencyLoader, isMobile } from 'osucad-framework';
import { Editor } from './editor/Editor';
import { Fit, ScalingContainer } from './editor/ScalingContainer';
import { EditorContext } from './editor/context/EditorContext';
import { ThemeColors } from './editor/ThemeColors';

export class OsucadGame extends Game {
  constructor(readonly context: EditorContext) {
    super();
  }

  get resolution() {
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

  @dependencyLoader()
  async init(): Promise<void> {
    this.dependencies.provide(new ThemeColors());

    this.add(this.#innerContainer);

    await this.context.load();

    this.context.provideDependencies(this.dependencies);

    const editor = new Editor(this.context);
    this.add(editor);

    editor.fadeIn({ duration: 300 });
  }
}
