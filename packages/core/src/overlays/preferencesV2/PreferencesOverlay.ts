import type { IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, MouseDownEvent } from '@osucad/framework';
import { Axes, Box, EasingFunction, VisibilityContainer } from '@osucad/framework';
import { EditorAction } from '../../editor/EditorAction';
import { PreferencesPanel } from './PreferencesPanel';

export class PreferencesOverlay extends VisibilityContainer implements IKeyBindingHandler<EditorAction> {
  readonly #backdrop: Box;

  readonly #preferencesPanel: PreferencesPanel;

  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
    this.alwaysPresent = true;

    this.children = [
      this.#backdrop = new Box({
        relativeSizeAxes: Axes.Both,
        color: 'black',
        alpha: 0.5,
      }),
      this.#preferencesPanel = new PreferencesPanel(),
    ];

    this.hide();
  }

  get panelOffset() {
    return Math.max(0, this.#preferencesPanel.drawPosition.x + this.#preferencesPanel.drawWidth);
  }

  override popIn() {
    this.#backdrop.fadeTo(0.5, 300, EasingFunction.OutQuad);
    this.#preferencesPanel.moveToX(0, 400, EasingFunction.OutExpo);
  }

  override popOut() {
    this.#backdrop.fadeOut(300, EasingFunction.OutQuad);
    this.#preferencesPanel.moveToX(-400, 650, EasingFunction.OutExpo);
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof EditorAction;
  }

  override get propagateNonPositionalInputSubTree(): boolean {
    return true;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    switch (e.pressed) {
      case EditorAction.ShowPreferences:
        if (!e.repeat)
          this.toggleVisibility();
        return true;
    }

    return false;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    this.hide();
    return true;
  }
}
