import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { EditorScreen } from './EditorScreen';
import { DrawableOptions } from '@/framework/drawable/Drawable';
import { NoArgsConstructor } from '@osucad/common';
import { LoadState } from '@/framework/drawable/LoadState';

export class EditorScreenContainer extends ContainerDrawable {
  constructor(
    options: DrawableOptions & {
      currentScreen: NoArgsConstructor<EditorScreen>;
    },
  ) {
    super(options);
    this.currentScreen = new options.currentScreen();
  }

  #currentScreen!: EditorScreen;

  get currentScreen() {
    return this.#currentScreen;
  }

  set currentScreen(value: EditorScreen) {
    if (this.#currentScreen) {
      const oldScreen = this.#currentScreen;
      oldScreen.hide(() => {
        this.remove(oldScreen, true);
      });
    }
    this.#currentScreen = value;
    this.add(value);
    if (value.loadState >= LoadState.Ready) {
      this.#currentScreen.show();
    }
  }
}
