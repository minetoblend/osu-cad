import type { ScreenExitEvent, ScreenTransitionEvent } from 'osucad-framework';
import type { BackgroundScreen } from './BackgroundScreen';
import { resolved, Screen } from 'osucad-framework';
import { BackgroundScreenStack } from './BackgroundScreenStack';

export abstract class OsucadScreen extends Screen {
  getPath?(): string;

  createBackground(): BackgroundScreen | null {
    return null;
  }

  @resolved(BackgroundScreenStack, true)
  protected backgroundStack?: BackgroundScreenStack;

  #ownedBackground: BackgroundScreen | null = null;

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    if (this.backgroundStack) {
      const background = this.#ownedBackground = this.createBackground();

      if (background)
        this.backgroundStack.push(background);
    }
  }

  onExiting(e: ScreenExitEvent): boolean {
    if (super.onExiting(e))
      return true;

    if (this.#ownedBackground && this.backgroundStack?.currentScreen === this.#ownedBackground)
      this.#ownedBackground.exit();

    return false;
  }

  applyToBackground(callback: (background: BackgroundScreen) => void) {
    if (this.#ownedBackground)
      callback(this.#ownedBackground);
  }
}
