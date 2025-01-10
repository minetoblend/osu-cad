import type { ClickEvent, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent } from 'osucad-framework';
import { EditorAction } from '../../EditorAction';
import { EditorButton } from './EditorButton';

export abstract class ToolbarToggleButton extends EditorButton implements IKeyBindingHandler<EditorAction> {
  override onClick(e: ClickEvent): boolean {
    this.active.toggle();
    return true;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof EditorAction;
  }

  #keyPressed = false;

  protected override get armed(): boolean {
    return this.#keyPressed || super.armed;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.repeat)
      return false;

    switch (e.pressed) {
      case EditorAction.ToggleGridSnap:
        this.active.toggle();
        this.#keyPressed = true;
        this.updateState();
        return true;
    }
    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<EditorAction>) {
    switch (e.pressed) {
      case EditorAction.ToggleGridSnap:
        this.#keyPressed = false;
        this.updateState();
    }
  }
}
