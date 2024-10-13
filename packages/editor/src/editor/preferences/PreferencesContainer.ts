import type {
  ContainerOptions,
  Drawable,
  IKeyBindingHandler,
  KeyBindingPressEvent,
  KeyDownEvent,
  List,
  Vec2,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  Bindable,
  Container,
  dependencyLoader,
  EasingFunction,
  Key,
} from 'osucad-framework';
import { OsucadGame } from '../../OsucadGame';
import { EditorAction } from '../EditorAction';
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
    width: 400,
  });

  readonly preferencesVisible = new Bindable(false);

  override buildPositionalInputQueue(screenSpacePos: Vec2, queue: List<Drawable>): boolean {
    if (!this.preferencesVisible.value)
      return super.buildPositionalInputQueue(screenSpacePos, queue);

    queue.push(this);
    this.#preferences.buildPositionalInputQueue(screenSpacePos, queue);

    return true;
  }

  override buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking?: boolean): boolean {
    if (!this.preferencesVisible.value)
      return super.buildNonPositionalInputQueue(queue, allowBlocking);

    queue.push(this);
    this.#preferences.buildNonPositionalInputQueue(queue, allowBlocking);

    return true;
  }

  showPreferences(): void {
    this.preferencesVisible.value = true;
  }

  hidePreferences(): void {
    this.preferencesVisible.value = false;
  }

  @dependencyLoader()
  load() {
    this.dependencies.resolve(OsucadGame).fullyLoaded.addListener(() => {
      this.#preferencesContainer.add((this.#preferences = new Preferences()));
      this.#preferences.x = -1;

      this.preferencesVisible.addOnChangeListener(evt => this.#updateVisibility(evt.value));
    });

    this.addAllInternal(
      this.#content,
      this.#preferencesContainer,
    );
  }

  #updateVisibility(visible: boolean) {
    if (visible) {
      this.#preferences.moveToX(0, 400, EasingFunction.OutQuart);

      this.#content.moveToX(50, 400, EasingFunction.OutQuart);
      this.#content.scaleTo(0.9, 400, EasingFunction.OutQuart);
      // this.#content.moveToY(50, 400, EasingFunction.OutQuart);

      this.#preferences.show();
    }
    else {
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

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Escape && this.preferencesVisible.value) {
      this.hidePreferences();
      return true;
    }

    return false;
  }
}
