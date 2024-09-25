import {
  Bindable,
  ClickEvent,
  IKeyBindingHandler,
  KeyBindingPressEvent,
  KeyDownEvent, KeyUpEvent, Scheduler,
} from 'osucad-framework';
import type { DoubleClickEvent } from '../../../framework/src/input/events/DoubleClickEvent';
import {
  Action,
  Anchor,
  Axes,
  BindableWithCurrent,
  Cached,
  clamp,
  CompositeDrawable,
  Container,
  dependencyLoader,
  EasingFunction,
  Key,
  LoadState,
  MouseButton,
  PlatformAction,
  resolved,
  TextInputSource,
} from 'osucad-framework';
import { BitmapFontManager } from 'pixi.js';
import { TabbableContainer } from '../../../framework/src/graphics/containers/TabbableContainer';
import { FastRoundedBox } from '../drawables/FastRoundedBox';
import { ThemeColors } from '../editor/ThemeColors';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { animate } from '../utils/animate';

export class TextBox extends TabbableContainer implements IKeyBindingHandler<PlatformAction> {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      height: 30,
    });
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: PlatformAction): boolean {
    return binding instanceof PlatformAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean {
    console.log('onKeyBindingPressed', e);
    if (!this.hasFocus)
      return false;

    switch (e.pressed) {
      case PlatformAction.MoveForwardChar:
        this.#moveCursor(1, false);
        return true;
      case PlatformAction.MoveBackwardChar:
        this.#moveCursor(-1, false);
        return true;
      case PlatformAction.MoveForwardWord:
        this.#moveCursor(1, true);
        return true;
      case PlatformAction.MoveBackwardWord:
        this.#moveCursor(-1, true);
        return true;
      case PlatformAction.DeleteForwardChar:
        this.#deleteForwardChar();
        return true;
      case PlatformAction.SelectForwardChar:
        this.#selectForwardChar();
        return true;
      case PlatformAction.SelectBackwardChar:
        this.#selectBackwardChar();
        return true;

      case PlatformAction.DeleteBackwardChar:
        this.#deleteBackwardChar();
        return true;
      case PlatformAction.DeleteForwardWord:
        this.#deleteForwardWord();
        return true;
      case PlatformAction.DeleteBackwardWord:
        this.#deleteBackwardWord();
        return true;
      case PlatformAction.SelectAll:
        this.selectAll();
        return true;
    }

    return false;
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (!this.hasFocus)
      return false;

    switch (e.key) {
      case Key.Escape:
        if (!e.repeat)
          this.killFocus();
        return true;
      case Key.Enter:
      case Key.NumpadEnter:
        if (e.altPressed)
          return false;

        if (!e.repeat && this.commitOnEnter) {
          this.commit();

          return true;
        }

        return false;
      case Key.Backspace:
      case Key.Delete:
        return false;
    }

    let wasBlocking = this.#textInputBlocking;
    this.#textInputScheduler.update();

    console.log('wasBlocking', wasBlocking, 'isBlocking', this.#textInputBlocking);

    return super.onKeyDown(e) || this.#textInputBlocking;
  }

  onKeyUp() {
    this.scheduler.addOnce(this.#revertBlockingStateIfRequired, this);
  }

  readonly #textInputScheduler = new Scheduler(null);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x000000,
        alpha: 0.4,
        cornerRadius: 4,
      }),
      this.#textContainer = new Container({
        relativeSizeAxes: Axes.Both,
        padding: { horizontal: 8, vertical: 7 },
        children: [
          this.#placeholder = this.createPlaceholder().with({
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            x: 2,
          }),
          this.#caret = new Caret().with({
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
          this.#spriteText = this.createText().with({
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        ],
      }),
    );

    this.current.addOnChangeListener(e => this.text = e.value);
  }

  update() {
    super.update();

    this.#textInputScheduler.update();
  }

  #textContainer!: Container;

  #placeholder!: OsucadSpriteText;

  #placeholderText = '';

  get placeholderText() {
    return this.#placeholderText;
  }

  set placeholderText(value) {
    this.#placeholderText = value;
    if (this.loadState >= LoadState.Ready)
      this.#placeholder.text = value;
  }

  #caret!: Caret;

  #spriteText!: OsucadSpriteText;

  #textAndLayout = new Cached();

  get canBeTabbedTo(): boolean {
    return !this.current.disabled;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  createPlaceholder(): OsucadSpriteText {
    return new OsucadSpriteText({
      text: this.placeholderText,
      color: this.colors.text,
      alpha: 0.5,
    });
  }

  createText(): OsucadSpriteText {
    return new OsucadSpriteText({
      color: this.colors.text,
    });
  }

  protected getPositionAt(position: number) {
    position = clamp(position, 0, this.text.length);

    const text = this.text.slice(0, position);

    if (text.length === 0) {
      return 0;
    }

    const { width, scale, lines } = BitmapFontManager.getLayout(text, this.#spriteText.style);

    let whiteSpaceWidth = 4.1;

    if (lines.length > 0) {
      whiteSpaceWidth = lines[0].spaceWidth * scale;
    }

    const trailingWhitespaceCount = text.length - text.trimEnd().length;

    return width * scale + trailingWhitespaceCount * whiteSpaceWidth;
  }

  cursor = new TextCursor();

  updateAfterChildren() {
    super.updateAfterChildren();

    if (!this.cursor.isValid || !this.#textAndLayout.isValid) {
      this.cursor.validate();
      this.#textAndLayout.validate();

      this.#updateCaret();

      this.#spriteText.text = this.text;

      if (this.#text.length === 0)
        this.#placeholder.show();
      else
        this.#placeholder.hide();
    }
  }

  #updateCaret() {
    if (!this.hasFocus) {
      this.#caret.hide();
      return;
    }

    this.#caret.show();

    const position = this.getPositionAt(this.cursor.rangeLeft);

    if (this.cursor.isRange) {
      const positionEnd = this.getPositionAt(this.cursor.rangeRight);

      this.#caret.setPosition(position, positionEnd - position);
    } else {
      this.#caret.setPosition(position);
    }
  }

  @resolved(TextInputSource)
  protected textInput!: TextInputSource;

  protected startAcceptingInput() {
    console.log('startAcceptingInput');
    this.textInput.activate();
    this.textInput.onTextInput.addListener(this.#onTextInput);
  }

  protected endAcceptingInput() {
    this.#textInputBlocking = false;

    console.log('endAcceptingInput');
    this.textInput.deactivate();
    this.textInput.onTextInput.removeListener(this.#onTextInput);
  }

  onFocus() {
    this.startAcceptingInput();
    this.#textAndLayout.invalidate();

    return true;
  }

  onFocusLost() {
    this.endAcceptingInput();
    this.#textAndLayout.invalidate();

    if (this.commitOnFocusLost)
      this.commit();
  }

  #textInputBlocking = false;

  #onTextInput = (text: string) => this.#textInputScheduler.add(() => {
    this.#textInputBlocking = true;
    this.insertTextAtCursor(text);

    this.scheduler.addOnce(this.#revertBlockingStateIfRequired, this);
  });

  #revertBlockingStateIfRequired() {
    if (this.#textInputBlocking && !this.getContainingInputManager()!.currentState.keyboard.keys.hasAnyButtonPressed)
      this.#textInputBlocking = false;
  }

  #current = new BindableWithCurrent<string>('');

  get current() {
    return this.#current.current;
  }

  set current(value) {
    this.#current.current = value;
  }

  #text = '';

  get text() {
    return this.#text;
  }

  set text(value) {
    if (this.current.disabled)
      return;

    if (this.#text === value)
      return;

    this.#text = value;
    this.#textAndLayout.invalidate();

    if (this.commitImmediately)
      this.commit();
  }

  commitImmediately = false;

  commitOnFocusLost = true;

  commitOnEnter = true;

  readonly onCommit = new Action<string>();

  commit() {
    this.current.value = this.text;
    this.onCommit.emit(this.text);
  }

  cancel() {
    this.text = this.current.value;
  }

  protected insertTextAtCursor(text: string) {
    this.text = this.text.slice(0, this.cursor.rangeLeft) + text + this.text.slice(this.cursor.rangeRight);
    this.cursor.moveTo(this.cursor.rangeLeft + text.length);
  }

  #getStartOfWordForward(text: string, position: number) {
    while (position < text.length && text[position] !== ' ') {
      position++;
    }

    while (position < text.length && text[position] === ' ') {
      position++;
    }

    return position;
  }

  #getStartOfWordBackward(text: string, position: number) {
    while (position > 0 && text[position - 1] === ' ') {
      position--;
    }

    while (position > 0 && text[position - 1] !== ' ') {
      position--;
    }

    return position;
  }

  #moveCursor(direction: number, word: boolean) {
    direction = Math.sign(direction);
    let position = direction === -1 ? this.cursor.rangeLeft : this.cursor.rangeRight;

    if (word) {
      if (direction > 0)
        position = this.#getStartOfWordForward(this.text, position);
      else
        position = this.#getStartOfWordBackward(this.text, position);

      this.cursor.moveTo(clamp(position, 0, this.text.length));
    } else if (this.cursor.isRange) {
      this.cursor.moveTo(position);
    } else {
      this.cursor.moveTo(clamp(position + direction, 0, this.text.length));
    }
  }

  #deleteRange(start: number, end: number) {
    const text = this.text;
    this.text = text.slice(0, start) + text.slice(end);
    this.cursor.moveTo(start);
  }

  #deleteSelection() {
    this.#deleteRange(this.cursor.rangeLeft, this.cursor.rangeRight);
  }

  #deleteForwardChar() {
    if (this.cursor.isRange) {
      this.#deleteSelection();
      return;
    }

    this.#deleteRange(this.cursor.rangeLeft, this.cursor.rangeLeft + 1);
  }

  #deleteBackwardChar() {
    if (this.cursor.isRange) {
      this.#deleteSelection();
      return;
    }

    this.text = this.text.slice(0, this.cursor.rangeLeft - 1) + this.text.slice(this.cursor.rangeLeft);
    this.cursor.moveTo(this.cursor.rangeLeft - 1);
  }

  #deleteForwardWord() {
    const text = this.text;
    const start = this.cursor.rangeLeft;
    let end = start;

    while (end < text.length && text[end] === ' ') {
      end++;
    }

    while (end < text.length && text[end] !== ' ') {
      end++;
    }

    this.#deleteRange(start, end);
  }

  #deleteBackwardWord() {
    if (this.cursor.isRange) {
      this.#deleteRange(this.cursor.rangeLeft, this.cursor.rangeRight);
      return;
    }

    const text = this.text;
    let start = this.cursor.rangeLeft;
    const end = start;

    while (start > 0 && text[start - 1] === ' ') {
      start--;
    }

    while (start > 0 && text[start - 1] !== ' ') {
      start--;
    }

    this.#deleteRange(start, end);
  }

  selectAll() {
    this.cursor.setRange(0, this.text.length);
  }

  #selectForwardChar() {
    this.cursor.end = Math.min(this.cursor.end + 1, this.text.length);
  }

  #selectBackwardChar() {
    this.cursor.end = Math.max(this.cursor.end - 1, 0);
  }

  get acceptsFocus(): boolean {
    return true;
  }

  getIndexAt(position: number) {
    const layout = BitmapFontManager.getLayout(this.text, this.#spriteText.style);

    if (layout.lines.length > 0) {
      const line = layout.lines[0];

      let cursorPosition = 0;

      if (position >= layout.width * layout.scale) {
        cursorPosition = this.text.length;
      } else {
        for (let i = 0; i < line.charPositions.length; i++) {
          cursorPosition = i;

          if (i < line.charPositions.length - 1) {
            const boundary = (line.charPositions[i] + line.charPositions[i + 1]) / 2 * layout.scale;

            if (position < boundary) {
              break;
            }
          } else {
            if (position < line.charPositions[i] * layout.scale) {
              break;
            }
          }
        }
      }
      return cursorPosition;
    }

    return 0;
  }

  onClick(e: ClickEvent): boolean {
    if (e.button === MouseButton.Left) {
      const position = e.mousePosition.x - 8;

      this.cursor.moveTo(this.getIndexAt(position));
      this.#caret.finishTransforms();

      return true;
    }

    return false;
  }

  onDoubleClick(e: DoubleClickEvent): boolean {
    if (e.button === MouseButton.Left) {
      const position = this.getIndexAt(e.mousePosition.x - 8);

      const start = this.#getStartOfWordBackward(this.text, position);
      let end = start;
      for (let i = start + 1; i < this.text.length; i++) {
        if (this.text[i] === ' ') {
          break;
        }
        end = i;
      }

      this.cursor.setRange(start, end + 1);

      return true;
    }

    return false;
  }

  bindToNumber(bindable: Bindable<number>) {
    const format = (value: number) => (Math.round(value * 10000) / 10000).toString();

    bindable.addOnChangeListener(e => this.text = format(e.value), { immediate: true });

    this.onCommit.addListener((e) => {
      const value = Number.parseFloat(e);

      if (!Number.isNaN(value)) {
        bindable.value = value;
        bindable.triggerChange();
      } else {
        this.text = format(bindable.value);
      }
    });

    return this;
  }

  killFocus() {
    this.getContainingFocusManager()?.changeFocus(null);
  }
}

class Caret extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.width = 2;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  #caret!: FastRoundedBox;

  @dependencyLoader()
  load() {
    this.addInternal(this.#caret = new FastRoundedBox({
      relativeSizeAxes: Axes.Both,
      color: this.colors.text,
      cornerRadius: 0.5,
    }));
  }

  isRange = false;

  setPosition(position: number, width = 0) {
    this.isRange = width > 0;

    if (this.isRange) {
      this.moveToX(position, 100, EasingFunction.OutExpo);
      this.fadeTo(0.6);
      this.#caret.alpha = 1;
      this.resizeWidthTo(width, 100, EasingFunction.OutExpo);
    } else {
      this.moveToX(position - 1, 100, EasingFunction.OutExpo);
      this.fadeIn(100, EasingFunction.OutExpo);
      this.resizeWidthTo(2, 100, EasingFunction.OutExpo);
    }
  }

  flashDuration = 750;

  flashInRatio = 0.125;

  update() {
    super.update();

    if (!this.isRange) {
      const time = (this.time.current % this.flashDuration) / this.flashDuration;

      if (time < this.flashInRatio) {
        this.#caret.alpha = animate(time, 0, this.flashInRatio, 0.75, 1);
      } else {
        this.#caret.alpha = animate(time, this.flashInRatio, 1, 1, 0.5);
      }
    } else {
      this.#caret.alpha = 0.4;
    }
  }
}

class TextCursor {
  #start = 0;
  #end = 0;

  isValid = true;

  invalidate() {
    this.isValid = false;
  }

  validate() {
    this.isValid = true;
  }

  get end() {
    return this.#end;
  }

  set end(value) {
    this.#end = value;
    this.invalidate();
  }

  get start() {
    return this.#start;
  }

  set start(value) {
    this.#start = value;
    this.invalidate();
  }

  get isRange() {
    return this.start !== this.end;
  }

  get rangeLeft() {
    return Math.min(this.start, this.end);
  }

  get rangeRight() {
    return Math.max(this.start, this.end);
  }

  moveTo(position: number) {
    if (position < 0)
      position = 0;

    this.start = position;
    this.end = position;

    this.invalidate();
  }

  setRange(start: number, end: number) {
    this.start = start;
    this.end = end;

    this.invalidate();
  }

  onUpdate = new Action();
}
