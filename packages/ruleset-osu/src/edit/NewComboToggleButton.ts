import type { ClickEvent, Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import { EditorAction, OsucadColors } from '@osucad/common';
import { getIcon } from '@osucad/resources';
import { Anchor, Axes, DrawableSprite, resolved } from 'osucad-framework';
import { GlobalNewComboBindable } from './GlobalNewComboBindable';
import { TernaryStateToggleButton } from './TernaryStateToggleButton';

export class NewComboToggleButton extends TernaryStateToggleButton implements IKeyBindingHandler<EditorAction> {
  constructor() {
    super();
  }

  @resolved(GlobalNewComboBindable)
  newCombo!: GlobalNewComboBindable;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.ternaryState.bindTo(this.newCombo);
  }

  #icon!: DrawableSprite;

  protected override createContent(): Drawable {
    return this.#icon = new DrawableSprite({
      texture: getIcon('new combo'),
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

  #keyPressed = false;

  protected override get armed(): boolean {
    return super.armed || this.#keyPressed;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof EditorAction;
  }

  override onClick(e: ClickEvent): boolean {
    this.toggleState();
    return true;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.repeat)
      return false;

    if (e.pressed === EditorAction.ToggleNewCombo) {
      this.toggleState();

      this.#keyPressed = true;
      this.updateState();

      return true;
    }

    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<EditorAction>) {
    if (e.pressed === EditorAction.ToggleNewCombo) {
      this.#keyPressed = false;
      this.updateState();
    }
  }
}
