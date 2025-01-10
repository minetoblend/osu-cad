import type { Bindable, Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent } from 'osucad-framework';
import { getIcon } from '@osucad/resources';
import { Anchor, Axes, DrawableSprite } from 'osucad-framework';
import { EditorAction } from '../../../../editor/EditorAction';
import { ToolbarToggleButton } from '../../../../editor/screens/compose/ToolbarToggleButton';
import { OsucadColors } from '../../../../OsucadColors';

export class GridSnapToggleButton extends ToolbarToggleButton implements IKeyBindingHandler<EditorAction> {
  constructor(bindable: Bindable<boolean>) {
    super();

    this.active.bindTo(bindable);
  }

  #icon!: DrawableSprite;

  protected override createContent(): Drawable {
    return this.#icon = new DrawableSprite({
      texture: getIcon('grid'),
      relativeSizeAxes: Axes.Both,
      size: 0.65,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      color: OsucadColors.text,
    });
  }

  protected override updateState() {
    super.updateState();

    if (this.active.value)
      this.#icon.color = this.isHovered ? OsucadColors.primaryHighlight : OsucadColors.primary;
    else
      this.#icon.color = this.isHovered ? 0xFFFFFF : OsucadColors.text;
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
