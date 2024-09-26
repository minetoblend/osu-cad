import type { ContainerOptions, IKeyBindingHandler, KeyBindingPressEvent } from 'osucad-framework';
import { Anchor, Axes, Bindable, Container, dependencyLoader, EasingFunction } from 'osucad-framework';
import { EditorAction } from '../EditorAction';
import { MouseTrap } from '../MouseTrap';
import { Preferences } from './Preferences';

export class PreferencesContainer
  extends Container
  implements IKeyBindingHandler<EditorAction> {
  constructor(options: ContainerOptions = {}) {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.with(options);
  }

  #content = new Container({
    relativeSizeAxes: Axes.Both,
    origin: Anchor.CenterRight,
    anchor: Anchor.CenterRight,
    masking: true,
  });

  get content() {
    return this.#content;
  }

  #preferences!: Preferences;

  #preferencesContainer = new Container({
    relativeSizeAxes: Axes.Y,
    width: 300,
  });

  #closeTrap = new MouseTrap({
    action: () => this.hidePreferences(),
  });

  readonly preferencesVisible = new Bindable(false);

  showPreferences(): void {
    this.preferencesVisible.value = true;
  }

  hidePreferences(): void {
    this.preferencesVisible.value = false;
  }

  @dependencyLoader()
  load() {
    this.#preferencesContainer.add((this.#preferences = new Preferences()));
    this.addAllInternal(
      this.#content,
      this.#closeTrap,
      this.#preferencesContainer,
    );

    this.#preferences.x = -1;

    this.preferencesVisible.addOnChangeListener(
      ({ value: visible }) => {
        this.#updateVisibility(visible);
      },
      { immediate: true },
    );
  }

  #updateVisibility(visible: boolean) {
    if (visible) {
      this.#closeTrap.isActive = true;

      this.#preferences.moveToX(0, 400, EasingFunction.OutQuart);

      this.#content.moveToX(50, 400, EasingFunction.OutQuart);
      this.#content.scaleTo(0.9, 400, EasingFunction.OutQuart);
      // this.#content.moveToY(50, 400, EasingFunction.OutQuart);

      this.#preferences.show();
    }
    else {
      this.#closeTrap.isActive = false;

      this.#preferences.moveToX(-1, 400, EasingFunction.OutQuart);

      this.#content.moveToX(0, 400, EasingFunction.OutQuart);
      this.#content.scaleTo(1, 400, EasingFunction.OutQuart);
      this.#content.moveToY(0, 400, EasingFunction.OutQuart);

      this.#preferences.hide();
    }
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: EditorAction): boolean {
    return binding === EditorAction.ShowPreferences;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    switch (e.pressed) {
      case EditorAction.ShowPreferences:
        if (this.preferencesVisible.value) {
          this.hidePreferences();
        }
        else {
          this.showPreferences();
        }
        return true;
    }

    return false;
  }

  override onMouseDown(): boolean {
    if (this.preferencesVisible.value) {
      this.hidePreferences();
      return true;
    }

    return false;
  }
}
