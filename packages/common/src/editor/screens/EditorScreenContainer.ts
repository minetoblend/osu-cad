import type { EditorScreen } from './EditorScreen';
import type { EditorScreenEntry } from './EditorScreenManager';
import {
  Axes,
  Bindable,
  CompositeDrawable,
  type ReadonlyDependencyContainer,
  resolved,
} from 'osucad-framework';
import { EditorScreenManager } from './EditorScreenManager';

export class EditorScreenContainer extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(EditorScreenManager)
  private screenManager!: EditorScreenManager;

  private readonly currentScreen = new Bindable<EditorScreenEntry>(null!);

  #currentScreenDrawable: EditorScreen | null = null;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.currentScreen.bindTo(this.screenManager.currentScreen);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.currentScreen.addOnChangeListener((screen) => {
      if (this.#currentScreenDrawable) {
        this.#currentScreenDrawable.onExiting();
        this.#currentScreenDrawable.expire();
      }

      // eslint-disable-next-line new-cap
      const drawable = new (screen.value.drawable)();
      this.addInternal(drawable);

      drawable.doWhenLoaded(() => drawable.onEntering());

      this.#currentScreenDrawable = drawable;
    }, { immediate: true });
  }
}
