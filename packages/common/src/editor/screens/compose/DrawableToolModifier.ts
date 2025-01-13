import type { Key, KeyDownEvent, KeyUpEvent, MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { ToolModifier } from './ToolModifier';
import { Anchor, Axes, BindableBoolean, Container, EasingFunction, FastRoundedBox, FillDirection, FillFlowContainer, KeyCombination, Vec2 } from 'osucad-framework';
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
          this.#background = new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 4,
            color: OsucadColors.translucent,
            alpha: 0.5,
          }),
          this.#shortcutHint = new Container({
            autoSizeAxes: Axes.Both,
            padding: 4,
            child: new DrawableInputKey(modifier.inputKey),
          }),
        ],
      }),
      this.#hint = new OsucadSpriteText({
        text: modifier.hint,
        color: OsucadColors.text,
        fontSize: 12,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
    ];
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.isActive.bindTo(this.modifier.isActive);
    this.disabled.bindTo(this.modifier.disabled);

    this.isActive.bindValueChanged(this.#updateState, this);
    this.disabled.bindValueChanged(this.#updateState, this);

    this.#updateState();
  }

  isActive = new BindableBoolean();

  disabled = new BindableBoolean();

  #background!: FastRoundedBox;
  #shortcutHint!: Container;
  #hint!: OsucadSpriteText;

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (KeyCombination.keyBindingContains([this.modifier.inputKey], KeyCombination.fromMouseButton(e.button))) {
      this.#onPressed();
    }

    return false;
  }

  override onMouseUp(e: MouseUpEvent) {

  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.repeat || this.disabled.value)
      return false;

    if (this.#checkKey(e.key)) {
      this.#onPressed();
      return true;
    }

    return false;
  }

  override onKeyUp(e: KeyUpEvent) {
    if (this.#checkKey(e.key)) {
      this.#onReleased();
    }
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
    if (this.modifier.modifierType === ModifierType.Temporary)
      this.modifier.isActive.value = false;
  }

  #triggerAction() {
    this.modifier.activated.emit();
    this.#background.fadeTo(1).fadeTo(0.5, 500, EasingFunction.OutExpo);
    this.#shortcutHint
      .fadeColor(OsucadColors.primaryHighlight)
      .fadeColor(0xFFFFFF, 500, EasingFunction.OutExpo);

    this.#hint
      .fadeColor(OsucadColors.primaryHighlight)
      .fadeColor(OsucadColors.text, 500, EasingFunction.OutExpo)
      .fadeTo(1)
      .fadeTo(0.5, 500, EasingFunction.OutExpo);
  }

  #updateState() {
    if (this.disabled.value) {
      this.alpha = 0;
      return;
    }

    this.alpha = 1;

    if (this.isActive.value) {
      this.#background.fadeTo(1);
      this.#hint.fadeColor(OsucadColors.primaryHighlight);
      this.#shortcutHint.fadeTo(1).fadeColor(OsucadColors.primaryHighlight);
    }
    else {
      this.#background.fadeTo(0.5);
      this.#hint.fadeColor(OsucadColors.text);
      this.#shortcutHint.fadeColor(0xFFFFFF);
    }
  }
}
