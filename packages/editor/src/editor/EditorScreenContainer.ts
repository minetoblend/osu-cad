import type { Container, DependencyContainer } from 'osucad-framework';
import type { OsuPlayfield } from './hitobjects/OsuPlayfield';
import type { EditorScreen } from './screens/EditorScreen';
import { Anchor, Axes, CompositeDrawable, dependencyLoader, ScreenExitEvent, ScreenTransitionEvent } from 'osucad-framework';
import { EditorDependencies } from './EditorDependencies';
import { EditorScreenUtils } from './screens/EditorScreenUtils';

export class EditorScreenContainer extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
  }

  #reusablePlayfield!: OsuPlayfield;

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const { reusablePlayfield } = dependencies.resolve(EditorDependencies);

    this.#reusablePlayfield = reusablePlayfield;
  }

  #currentScreen: EditorScreen | null = null;

  get currentScreen(): EditorScreen | null {
    return this.#currentScreen;
  }

  showScreen(screen: EditorScreen): boolean {
    const currentScreen = this.currentScreen;

    if (currentScreen && currentScreen.constructor.name !== screen.constructor.name) {
      if (!this.#removeScreen(currentScreen, screen))
        return false;
    }

    this.#addScreen(screen, currentScreen);

    return true;
  }

  #removeScreen(screen: EditorScreen, nextScreen: EditorScreen | null = null) {
    if (this.#currentScreen !== screen)
      throw new Error('Cannot exit a screen that is not the current screen');

    if (screen.onExiting(new ScreenExitEvent(screen, nextScreen, nextScreen)))
      return false;

    screen.expire();

    screen.requestsNonPositionalInputSubTree = false;
    screen.requestsPositionalInputSubTree = false;

    this.#currentScreen = null;

    return true;
  }

  #addScreen(screen: EditorScreen, previousScreen: EditorScreen | null = null) {
    this.#currentScreen = screen;

    this.addInternal(screen);

    const event = new ScreenTransitionEvent(previousScreen, screen);

    screen.updateSubTree();
    screen.updateSubTreeTransforms();

    screen.schedule(() => {
      screen.onEntering(event);

      if (EditorScreenUtils.getPlayfieldOwner(this.#reusablePlayfield) !== screen) {
        EditorScreenUtils.setPlayfieldOwner(this.#reusablePlayfield, screen);
        if (this.#reusablePlayfield.parent) {
          const parent = this.#reusablePlayfield.parent as Container;

          // When switching between two screens which have a playfield, we are reparenting the old playfield while
          // maintaining its original screen space position. If the new screen did not take ownership of the playfield,
          // we need to remove it from the old screen's parent, so it doesn't try to place it at the position of a screen
          // which isn't the previous screen to the current one.
          parent.remove(this.#reusablePlayfield, false);
        }
      }
    });
  }
}
