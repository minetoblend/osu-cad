import {
  Anchor,
  Axes,
  Bindable,
  Container,
  ContainerOptions,
  dependencyLoader,
  IKeyBindingHandler,
  KeyBindingPressEvent,
} from 'osucad-framework';
import { Preferences } from './Preferences';
import gsap from 'gsap';
import { EditorAction } from '../EditorAction';
import { MouseTrap } from '../MouseTrap';

export class PreferencesContainer
  extends Container
  implements IKeyBindingHandler<EditorAction>
{
  constructor(options: ContainerOptions = {}) {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.apply(options);
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

    this.preferencesVisible.addOnChangeListener(
      (visible) => {
        this.#updateVisibility(visible);
      },
      { immediate: true },
    );
  }

  #updateVisibility(visible: boolean) {
    if (visible) {
      this.#closeTrap.isActive = true;

      gsap.to(this.#preferences, {
        x: 0,
        duration: 0.4,
        ease: 'power4.out',
      });

      gsap.to(this.#content, {
        x: 50,
        scaleX: 0.9,
        scaleY: 0.9,
        alpha: 0.5,
        duration: 0.4,
        ease: 'power4.out',
      });

      this.#preferences.show();
    } else {
      this.#closeTrap.isActive = false;

      gsap.to(this.#preferences, {
        x: -1,
        duration: 0.4,
        ease: 'power4.out',
      });

      gsap.to(this.#content, {
        x: 0,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 0.4,
        ease: 'power4.out',
      });

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
        } else {
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
