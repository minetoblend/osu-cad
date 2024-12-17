import type { IKeyBindingHandler, KeyBindingPressEvent } from 'osucad-framework';
import gsap from 'gsap';
import { Action, Anchor, Axes, Bindable, clamp, CompositeDrawable, Container, dependencyLoader, EasingFunction, FastRoundedBox, PlatformAction, resolved, TextInputSource } from 'osucad-framework';
import { BitmapFontManager } from 'pixi.js';
import { ThemeColors } from '../editor/ThemeColors';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { animate } from '../utils/animate';

export class SearchTextBox extends Container implements IKeyBindingHandler<PlatformAction> {
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
        this.#selectAll();
    }

    return false;
  }

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
          this.#text = this.createText().with({
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        ],
      }),
    );

    this.isActive.addOnChangeListener((e) => {
      if (e.value)
        this.onActivate();
      else
        this.onDeactivate();
    }, { immediate: true });

    this.isActive.value = true;

    this.cursor.onUpdate.addListener(() => {
      const start = this.getTextWidth(this.current.value.slice(0, this.cursor.rangeStart));

      if (this.cursor.isRange) {
        const end = this.getTextWidth(this.current.value.slice(0, this.cursor.rangeEnd));
        this.#caret.setPosition(start, end - start);
      }
      else {
        this.#caret.setPosition(start);
      }
    });

    this.current.addOnChangeListener((e) => {
      this.#text.text = e.value;

      this.#placeholder.alpha = e.value.length === 0 ? 0.5 : 0;
    });
  }

  #textContainer!: Container;

  #placeholder!: OsucadSpriteText;

  #caret!: Caret;

  #text!: OsucadSpriteText;

  @resolved(ThemeColors)
  colors!: ThemeColors;

  createPlaceholder(): OsucadSpriteText {
    return new OsucadSpriteText({
      text: 'Search',
      color: this.colors.text,
      alpha: 0.5,
    });
  }

  createText(): OsucadSpriteText {
    return new OsucadSpriteText({
      color: this.colors.text,
    });
  }

  protected getTextWidth(text: string) {
    if (text.length === 0) {
      return 0;
    }

    const whiteSpaceWidth = 4.1;

    if (text.trim().length === 0)
      return text.length * whiteSpaceWidth;

    const measurement = BitmapFontManager.measureText(text, this.#text.style);

    const trailingWhitespaceCount = text.length - text.trimEnd().length;

    return measurement.width * measurement.scale + trailingWhitespaceCount * whiteSpaceWidth;
  }

  cursor = new TextCursor();

  isActive = new Bindable<boolean>(false);

  @resolved(TextInputSource)
  protected textInput!: TextInputSource;

  protected onActivate() {
    this.textInput.activate();
    this.textInput.onTextInput.addListener(this.#onTextInput);
  }

  protected onDeactivate() {
    this.textInput.deactivate();
    this.textInput.onTextInput.removeListener(this.#onTextInput);
  }

  #onTextInput = (text: string) => {
    this.insertTextAtCursor(text);
  };

  current = new Bindable<string>('');

  protected insertTextAtCursor(text: string) {
    const currentText = this.current.value;

    this.current.value = currentText.slice(0, this.cursor.rangeStart) + text + currentText.slice(this.cursor.rangeEnd);
    this.cursor.moveTo(this.cursor.rangeStart + text.length);
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
    let position = direction === -1 ? this.cursor.rangeStart : this.cursor.rangeEnd;

    if (word) {
      if (direction > 0)
        position = this.#getStartOfWordForward(this.current.value, position);
      else
        position = this.#getStartOfWordBackward(this.current.value, position);

      this.cursor.moveTo(clamp(position, 0, this.textLength));
    }
    else if (this.cursor.isRange) {
      this.cursor.moveTo(position);
    }
    else {
      this.cursor.moveTo(clamp(position + direction, 0, this.textLength));
    }
  }

  #deleteRange(start: number, end: number) {
    const text = this.current.value;
    this.current.value = text.slice(0, start) + text.slice(end);
    this.cursor.moveTo(start);
  }

  #deleteSelection() {
    this.#deleteRange(this.cursor.rangeStart, this.cursor.rangeEnd);
  }

  #deleteForwardChar() {
    if (this.cursor.isRange) {
      this.#deleteSelection();
      return;
    }

    this.#deleteRange(this.cursor.rangeStart, this.cursor.rangeStart + 1);
  }

  #deleteBackwardChar() {
    if (this.cursor.isRange) {
      this.#deleteSelection();
      return;
    }

    const text = this.current.value;
    this.current.value = text.slice(0, this.cursor.rangeStart - 1) + text.slice(this.cursor.rangeStart);
    this.cursor.moveTo(this.cursor.rangeStart - 1);
  }

  #deleteForwardWord() {
    const text = this.current.value;
    const start = this.cursor.rangeStart;
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
      this.#deleteRange(this.cursor.rangeStart, this.cursor.rangeEnd);
      return;
    }

    const text = this.current.value;
    let start = this.cursor.rangeStart;
    const end = start;

    while (start > 0 && text[start - 1] === ' ') {
      start--;
    }

    while (start > 0 && text[start - 1] !== ' ') {
      start--;
    }

    this.#deleteRange(start, end);
  }

  #selectAll() {
    this.cursor.selectRange(0, this.textLength);
  }

  get textLength() {
    return this.current.value.length;
  }

  #selectForwardChar() {
    this.cursor.end = Math.min(this.cursor.end + 1, this.textLength);
  }

  #selectBackwardChar() {
    this.cursor.end = Math.max(this.cursor.end - 1, 0);
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
      this.fadeTo(0.4);
      this.#caret.alpha = 1;
      gsap.to(this, {
        width,
        duration: 0.1,
        ease: 'expo.out',
      });
    }
    else {
      this.moveToX(position - 1, 100, EasingFunction.OutExpo);
      this.fadeIn(100);
      gsap.to(this, {
        width: 2,
        duration: 0.1,
        ease: 'expo.out',
      });
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
      }
      else {
        this.#caret.alpha = animate(time, this.flashInRatio, 1, 1, 0.5);
      }
    }
    else {
      this.#caret.alpha = 0.4;
    }
  }
}

class TextCursor {
  #start = 0;
  #end = 0;

  get end() {
    return this.#end;
  }

  set end(value) {
    this.#end = value;
    this.onUpdate.emit();
  }

  get start() {
    return this.#start;
  }

  set start(value) {
    this.#start = value;
    this.onUpdate.emit();
  }

  get isRange() {
    return this.start !== this.end;
  }

  get rangeStart() {
    return Math.min(this.start, this.end);
  }

  get rangeEnd() {
    return Math.max(this.start, this.end);
  }

  moveTo(position: number) {
    if (position < 0)
      position = 0;

    this.start = position;
    this.end = position;

    this.onUpdate.emit();
  }

  selectRange(start: number, end: number) {
    this.start = start;
    this.end = end;

    this.onUpdate.emit();
  }

  onUpdate = new Action();
}
