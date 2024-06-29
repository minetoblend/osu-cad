import { Axes, Container } from 'osucad-framework';
import { EditorScreen } from './screens/EditorScreen';

export class EditorScreenContainer extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  #currentScreen: EditorScreen | null = null;

  get screen(): EditorScreen | null {
    return this.#currentScreen;
  }

  set screen(screen: EditorScreen) {
    if (screen.constructor.name === this.#currentScreen?.constructor.name) {
      return;
    }

    if (this.#currentScreen) {
      this.#currentScreen.hide();
      this.#currentScreen.expire();
    }

    this.#currentScreen = screen;
    this.addInternal(screen);
    screen.show();
  }
}
