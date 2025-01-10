import type { ToolModifier } from './ToolModifier';
import { Anchor, Axes, BindableBoolean, Container, FastRoundedBox, FillDirection, FillFlowContainer, type Key, KeyCombination, type KeyDownEvent, type KeyUpEvent, Vec2 } from 'osucad-framework';
import { DrawableInputKey } from '../../../drawables/DrawableInputKey';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../OsucadColors';
import { ModifierType } from './ToolModifier';

export class DrawableToolModifier extends FillFlowContainer {
  constructor(readonly modifier: ToolModifier) {
    super();

    this.autoSizeAxes = Axes.Both;
    this.anchor = this.origin = Anchor.CenterLeft;
    this.direction = FillDirection.Horizontal;
    this.spacing = new Vec2(4);

    this.internalChildren = [
      new Container({
        autoSizeAxes: Axes.Both,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        children: [
          new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 4,
            color: OsucadColors.translucent,
            alpha: 0.5,
          }),
          new Container({
            autoSizeAxes: Axes.Both,
            padding: 4,
            child: new DrawableInputKey(modifier.inputKey),
          }),
        ],
      }),
      new OsucadSpriteText({
        text: modifier.hint,
        color: OsucadColors.text,
        fontSize: 14,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
    ];

    this.isActive.bindTo(modifier.isActive);
    this.disabled.bindTo(modifier.disabled);
  }

  isActive = new BindableBoolean();

  disabled = new BindableBoolean();

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.repeat)
      return false;

    if (this.#checkKey(e.key)) {
      this.#onReleased();
      return true;
    }

    return false;
  }

  override onKeyUp(e: KeyUpEvent) {
    if (this.#checkKey(e.key))
      this.#onPressed();
  }

  #checkKey(key: Key) {
    const inputKey = KeyCombination.fromKey(key);

    return KeyCombination.keyBindingContains([this.modifier.inputKey], inputKey);
  }

  #onPressed() {
    switch (this.modifier.modifierType) {
      case ModifierType.Temporary:
        this.modifier.isActive.value = true;
        break;
      case ModifierType.Toggle:
        this.modifier.isActive.toggle();
        break;
      case ModifierType.Action:
        this.#triggerAction();
        break;
    }
  }

  #onReleased() {
    switch (this.modifier.modifierType) {
      case ModifierType.Temporary:
        this.modifier.isActive.value = false;
        break;
    }
  }

  #triggerAction() {
    this.modifier.activated.emit();
  }
}
