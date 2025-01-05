import type { CursorContainer, InputManager, ReadonlyDependencyContainer } from 'osucad-framework';
import type { IProvideCursor } from './IProvideCursor';
import { Axes, BindableBoolean, Container, isSourcedFromTouch } from 'osucad-framework';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { DefaultCursorContainer } from './DefaultCursorContainer';
import { providesCursor } from './IProvideCursor';

export class GlobalCursorDisplay extends Container implements IProvideCursor {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  useNativeCursor = new BindableBoolean(false);

  #defaultCursor!: DefaultCursorContainer;

  #inputManager!: InputManager;

  readonly providesCursor = true;

  get cursor(): CursorContainer {
    return this.#defaultCursor;
  }

  get providingUserCursor(): boolean {
    return true;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(OsucadConfigManager);
    config.bindWith(OsucadSettings.NativeCursor, this.useNativeCursor);

    this.addInternal(
      this.#defaultCursor = new DefaultCursorContainer().adjust(it => it.hide()),
    );

    this.useNativeCursor.addOnChangeListener((enabled) => {
      if (enabled.value) {
        this.hide();

        document.body.style.cursor = 'default';
      }
      else {
        this.show();

        document.body.style.cursor = 'none';
      }
    }, { immediate: true });
  }

  protected override loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  showDuringTouch = new BindableBoolean();

  get showCursor() {
    return true;
  }

  #currentOverrideProvider: IProvideCursor | null = null;

  override update() {
    super.update();

    const lastMouseSource = this.#inputManager.currentState.mouse.lastSource;
    const hasValidInput = lastMouseSource !== undefined && (this.showDuringTouch.value || !isSourcedFromTouch(lastMouseSource));

    if (!hasValidInput || !this.showCursor) {
      this.#currentOverrideProvider?.cursor?.hide();
      this.#currentOverrideProvider = null;
      return;
    }

    // eslint-disable-next-line ts/no-this-alias
    let newOverrideProvider: IProvideCursor = this;

    for (const drawable of this.#inputManager.hoveredDrawables) {
      if (providesCursor(drawable) && drawable.providingUserCursor) {
        newOverrideProvider = drawable;
        break;
      }
    }

    if (this.#currentOverrideProvider === newOverrideProvider)
      return;

    this.#currentOverrideProvider?.cursor?.hide();
    newOverrideProvider.cursor?.show();

    this.#currentOverrideProvider = newOverrideProvider;
  }
}
