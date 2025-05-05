import type { Bindable } from '../../bindables/Bindable';
import type { IKeyBindingHandler } from '../../input/bindings/IKeyBindingHandler';
import type { ClickEvent } from '../../input/events/ClickEvent';
import type { DoubleClickEvent } from '../../input/events/DoubleClickEvent';
import type { DragEvent } from '../../input/events/DragEvent';
import type { DragStartEvent } from '../../input/events/DragStartEvent';
import type { FocusEvent } from '../../input/events/FocusEvent';
import type { FocusLostEvent } from '../../input/events/FocusLostEvent';
import type { KeyBindingPressEvent } from '../../input/events/KeyBindingPressEvent';
import type { KeyDownEvent } from '../../input/events/KeyDownEvent';
import type { KeyUpEvent } from '../../input/events/KeyUpEvent';
import type { MouseDownEvent } from '../../input/events/MouseDownEvent';
import type { MouseUpEvent } from '../../input/events/MouseUpEvent';
import type { KeyBindingAction } from '../../input/KeyBindingAction';
import type { TextRemovedEvent } from '../../input/TextInputSource';
import { debugAssert } from "../../utils/debugAssert";
import type { MaskingContainer } from '../containers/MaskingContainer';
import type { Drawable } from '../drawables/Drawable';
import type { Caret } from './Caret';
import { Action } from '../../bindables/Action';
import { BindableWithCurrent } from '../../bindables/BindableWithCurrent';
import { Cached } from '../../caching/Cached';
import { resolved } from '../../di/decorators';
import { PlatformAction } from '../../input/PlatformAction';
import { Key } from '../../input/state/Key';
import { TextInputSource } from '../../input/TextInputSource';
import { Vec2 } from '../../math/Vec2';
import { Scheduler } from '../../scheduling/Scheduler';
import { clamp } from '../../utils/clamp';
import { Container } from '../containers/Container';
import { FillDirection, FillFlowContainer } from '../containers/FillFlowContainer';
import { TabbableContainer } from '../containers/TabbableContainer';
import { Anchor } from '../drawables/Anchor';
import { Axes } from '../drawables/Axes';
import { EasingFunction } from '../transforms/EasingFunction';
import { SpriteText } from './SpriteText';
import { TextSelectionType } from './TextSelectionType';

export abstract class TextBox extends TabbableContainer implements IKeyBindingHandler<PlatformAction> {
  protected readonly textFlow: FillFlowContainer;

  protected readonly textContainer: Container;

  override get handleNonPositionalInput(): boolean {
    return this.hasFocus;
  }

  protected get leftRightPadding() {
    return 5;
  }

  lengthLimit: number | null = null;

  protected get allowClipboardExport() {
    return true;
  }

  protected get allowWordNavigation() {
    return true;
  }

  #doubleClickWord?: [number, number];

  protected get handleLeftRightArrows() {
    return true;
  }

  protected canAddCharacter(character: string) {
    return true;
  }

  #canAddCharacter(character: string) {
    return this.canAddCharacter(character);
  }

  #readonly = false;

  get readonly() {
    return this.#readonly;
  }

  set readonly(value) {
    this.#readonly = value;
    if (value)
      this.killFocus();
  }

  releaseFocusOnCommit = true;

  commitOnFocusLost = true;

  override get canBeTabbedTo(): boolean {
    return !this.readonly;
  }

  @resolved(TextInputSource)
  private textInput!: TextInputSource;

  readonly #caret: Caret;

  readonly #textInputScheduler = new Scheduler(null);

  #content: MaskingContainer;

  override get content(): Container<Drawable> {
    return this.#content;
  }

  override get cornerRadius() {
    return this.#content.cornerRadius;
  }

  override set cornerRadius(value) {
    this.#content.cornerRadius = value;
  }

  constructor() {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = 30;

    this.internalChild = this.#content = new Container({
      masking: true,
      relativeSizeAxes: Axes.Both,
      children: [
        this.textContainer = new Container({
          autoSizeAxes: Axes.X,
          relativeSizeAxes: Axes.Y,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
          position: new Vec2(this.leftRightPadding, 0),
          children: [
            this.placeholder = this.createPlaceholder().adjust((p) => {
              p.anchor = Anchor.CenterLeft;
              p.origin = Anchor.CenterLeft;
            }),
            this.#caret = this.createCaret().adjust((c) => {
              c.anchor = Anchor.CenterLeft;
              c.origin = Anchor.CenterLeft;
            }),
            this.textFlow = new FillFlowContainer({
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
              direction: FillDirection.Horizontal,
              autoSizeAxes: Axes.Both,
            }),
          ],
        }),
      ],
    });

    this.current.valueChanged.addListener((e) => {
      if (this.text !== e.value)
        this.text = e.value;
    });

    this.#caretVisible = false;
    this.#caret.hide();
  }

  protected override loadComplete() {
    super.loadComplete();

    this.#setText(this.text);
  }

  // region IKeyBindingHandler

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof PlatformAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean {
    if (!this.hasFocus)
      return false;

    if (!this.handleLeftRightArrows && (e.pressed === PlatformAction.MoveBackwardChar || e.pressed === PlatformAction.MoveForwardChar))
      return false;

    const lastSelectionBounds = this.#getTextSelectionBounds();

    switch (e.pressed) {
      // TODO: copy/paste
      case PlatformAction.Copy:
        // navigator.clipboard.writeText(this.selectedText);
        return true;
      case PlatformAction.Cut:
        // navigator.clipboard.writeText(this.selectedText);
        // this.#removeSelection();
        return true;

      case PlatformAction.SelectAll:
        this.selectAll();
        this.#onTextSelectionChanged(TextSelectionType.All, lastSelectionBounds);
        return true;

      case PlatformAction.MoveBackwardChar:
        if (this.#hasSelection) {
          this.moveCursorBy(this.#selectionLeft - this.#selectionEnd);
        }
        else {
          this.moveCursorBy(-1);
        }

        return true;

      case PlatformAction.MoveForwardChar:
        if (this.#hasSelection) {
          this.moveCursorBy(this.#selectionRight - this.#selectionEnd);
        }
        else {
          this.moveCursorBy(1);
        }

        return true;

      case PlatformAction.MoveBackwardWord:
        if (this.#hasSelection) {
          this.moveCursorBy(this.#selectionLeft - this.#selectionEnd);
        }
        else {
          this.moveCursorBy(this.getBackwardWordAmount());
        }

        return true;

      case PlatformAction.MoveForwardWord:
        if (this.#hasSelection) {
          this.moveCursorBy(this.#selectionRight - this.#selectionEnd);
        }
        else {
          this.moveCursorBy(this.getForwardWordAmount());
        }

        return true;

      case PlatformAction.MoveBackwardLine:
        this.moveCursorBy(this.getBackwardLineAmount());
        return true;

      case PlatformAction.MoveForwardLine:
        this.moveCursorBy(this.getForwardLineAmount());
        return true;

      case PlatformAction.DeleteBackwardChar:
        this.deleteBy(-1);
        return true;

      case PlatformAction.DeleteForwardChar:
        this.deleteBy(1);
        return true;

      case PlatformAction.DeleteBackwardWord:
        this.deleteBy(this.getBackwardWordAmount());
        return true;

      case PlatformAction.DeleteForwardWord:
        this.deleteBy(this.getForwardWordAmount());
        return true;

      case PlatformAction.DeleteBackwardLine:
        this.deleteBy(this.getBackwardLineAmount());
        return true;

      case PlatformAction.DeleteForwardLine:
        this.deleteBy(this.getForwardLineAmount());
        return true;

      case PlatformAction.SelectBackwardChar:
        this.expandSelectionBy(-1);
        this.#onTextSelectionChanged(TextSelectionType.Character, lastSelectionBounds);
        return true;

      case PlatformAction.SelectForwardChar:
        this.expandSelectionBy(1);
        this.#onTextSelectionChanged(TextSelectionType.Character, lastSelectionBounds);
        return true;

      case PlatformAction.SelectBackwardWord:
        this.expandSelectionBy(this.getBackwardWordAmount());
        this.#onTextSelectionChanged(TextSelectionType.Word, lastSelectionBounds);
        return true;

      case PlatformAction.SelectForwardWord:
        this.expandSelectionBy(this.getForwardWordAmount());
        this.#onTextSelectionChanged(TextSelectionType.Word, lastSelectionBounds);
        return true;

      case PlatformAction.SelectBackwardLine:
        this.expandSelectionBy(this.getBackwardLineAmount());
        this.#onTextSelectionChanged(TextSelectionType.All, lastSelectionBounds);
        return true;

      case PlatformAction.SelectForwardLine:
        this.expandSelectionBy(this.getForwardLineAmount());
        this.#onTextSelectionChanged(TextSelectionType.All, lastSelectionBounds);
        return true;
    }

    return false;
  }

  selectAll() {
    if (!this.hasFocus)
      return false;

    this.#selectionStart = 0;
    this.#selectionEnd = this.#text.length;
    this.#cursorAndLayout.invalidate();
    return true;
  }

  protected getBackwardWordAmount() {
    if (!this.allowWordNavigation)
      return -1;

    let searchPrev = clamp(this.#selectionEnd - 1, 0, Math.max(0, this.text.length - 1));
    while (searchPrev > 0 && this.#text[searchPrev] === ' ')
      searchPrev--;
    const lastSpace = this.#text.lastIndexOf(' ', searchPrev);
    return lastSpace > 0 ? -(this.#selectionEnd - lastSpace - 1) : -this.#selectionEnd;
  }

  protected getForwardWordAmount() {
    if (!this.allowWordNavigation)
      return 1;

    let searchNext = clamp(this.#selectionEnd, 0, Math.max(0, this.text.length - 1));
    while (searchNext < this.text.length && this.#text[searchNext] === ' ')
      searchNext++;
    const nextSpace = this.#text.indexOf(' ', searchNext);
    return (nextSpace >= 0 ? nextSpace : this.#text.length) - this.#selectionEnd;
  }

  protected getBackwardLineAmount() {
    return -this.text.length;
  }

  protected getForwardLineAmount() {
    return this.text.length;
  }

  protected moveCursorBy(amount: number) {
    const lastSelectionBounds = this.#getTextSelectionBounds();
    this.#selectionStart = this.#selectionEnd;
    this.#cursorAndLayout.invalidate();
    this.#moveSelection(amount, false);
    this.#onTextDeselected(lastSelectionBounds);
  }

  protected expandSelectionBy(amount: number) {
    this.#moveSelection(amount, true);
  }

  protected deleteBy(amount: number) {
    return;
    if (this.#selectionLength === 0)
      this.#selectionEnd = clamp(this.#selectionStart + amount, 0, this.#text.length);

    if (this.#hasSelection) {
      const removedText = this.#removeSelection();
      this.onUserTextRemoved(removedText);
    }
  }

  override dispose(isDisposing: boolean = true) {
    this.#unbindInput();

    super.dispose(isDisposing);
  }

  #textContainerPosX = 0;

  #textAtLastLayout = '';

  #updateCursorAndLayout() {
    this.#caret.height = this.fontSize;
    // TODO: Placeholder.Font = Placeholder.Font.With(size: FontSize);

    let cursorPos = 0;
    if (this.#text.length > 0)
      cursorPos = this.#getPositionAt(this.#selectionLeft);

    const cursorPosEnd = this.#getPositionAt(this.#selectionEnd);

    let selectionWidth: number | null = null;
    if (this.#hasSelection)
      selectionWidth = this.#getPositionAt(this.#selectionRight) - cursorPos;

    const cursorRelativePositionAxesInBox = (cursorPosEnd - this.#textContainerPosX) / (this.drawWidth - 2 * this.leftRightPadding);

    if (cursorRelativePositionAxesInBox < 0.1 || cursorRelativePositionAxesInBox > 0.9) {
      this.#textContainerPosX = cursorPosEnd - this.drawWidth / 2 + this.leftRightPadding * 2;
    }

    this.#textContainerPosX = clamp(this.#textContainerPosX, 0, Math.max(0, this.textFlow.drawWidth - this.drawWidth + this.leftRightPadding * 2));

    this.textContainer.moveToX(this.leftRightPadding - this.#textContainerPosX, 300, EasingFunction.OutExpo);

    if (this.#caretVisible)
      this.#caret.displayAt(new Vec2(cursorPos, 0), selectionWidth);

    if (this.#textAtLastLayout.length === 0 || this.#text.length === 0) {
      if (this.#text.length === 0)
        this.placeholder.show();
      else
        this.placeholder.hide();
    }

    this.#textAtLastLayout = this.#text;
  }

  override update() {
    super.update();

    this.#textInputScheduler.update();
  }

  override updateAfterChildren() {
    super.updateAfterChildren();

    if (!this.#cursorAndLayout.isValid) {
      this.#updateCaretVisibility();

      this.#updateCursorAndLayout();
      this.#cursorAndLayout.validate();

      if (this.#textInputBound) {
        this.textInput.setTextAndSelection(this.text, this.#selectionLeft, this.#selectionRight);
      }
    }
  }

  #getPositionAt(index: number): number {
    if (index > 0) {
      if (index < this.#text.length)
        return this.textFlow.children[index].drawPosition.x + this.textFlow.drawPosition.x;

      const d = this.textFlow.children[index - 1];
      return d.drawPosition.x + d.drawSize.x + this.textFlow.spacing.x + this.textFlow.drawPosition.x;
    }

    return 0;
  }

  #getCharacterClosestTo(pos: Vec2) {
    pos = this.toSpaceOfOtherDrawable(pos, this.textFlow);

    let i = 0;

    for (const d of this.textFlow.children) {
      if (d.drawPosition.x + d.drawSize.x / 2 > pos.x)
        break;

      i++;
    }

    return i;
  }

  #selectionStart = 0;
  #selectionEnd = 0;

  get #selectionLength() {
    return Math.abs(this.#selectionEnd - this.#selectionStart);
  }

  get #hasSelection() {
    return this.#selectionLength > 0;
  }

  get #selectionLeft() {
    return Math.min(this.#selectionStart, this.#selectionEnd);
  }

  get #selectionRight() {
    return Math.max(this.#selectionStart, this.#selectionEnd);
  }

  readonly #cursorAndLayout = new Cached();

  #moveSelection(offset: number, expand: boolean) {
    const oldStart = this.#selectionStart;
    const oldEnd = this.#selectionEnd;

    if (expand) {
      this.#selectionEnd = clamp(this.#selectionEnd + offset, 0, this.#text.length);
    }
    else {
      if (this.#hasSelection && Math.abs(offset) <= 1) {
        // we don't want to move the location when "removing" an existing selection, just set the new location.
        if (offset > 0)
          this.#selectionEnd = this.#selectionStart = this.#selectionRight;
        else
          this.#selectionEnd = this.#selectionStart = this.#selectionLeft;
      }
      else {
        this.#selectionEnd = this.#selectionStart = clamp((offset > 0 ? this.#selectionRight : this.#selectionLeft) + offset, 0, this.#text.length);
      }
    }

    if (oldStart !== this.#selectionStart || oldEnd !== this.#selectionEnd) {
      this.onCaretMoved(expand);
      this.#cursorAndLayout.invalidate();
    }
  }

  #textChanging = false;

  #beginTextChange() {
    if (this.#textChanging)
      return false;

    return this.#textChanging = true;
  }

  #endTextChange(started: boolean) {
    if (!started)
      return;

    if (this.current.value !== this.text)
      this.current.value = this.text;

    this.#textChanging = false;
  }

  #ignoreOngoingDragSelection = false;

  #removeSelection() {
    return this.#removeCharacters(this.#selectionLength);
  }

  #removeCharacters(number: number): string {
    if (this.current.disabled || this.#text.length === 0)
      return '';

    const removeStart = clamp(this.#selectionRight - number, 0, this.#selectionRight);
    const removeCount = this.#selectionRight - removeStart;

    if (removeCount === 0)
      return '';

    debugAssert(this.#selectionLength === 0 || removeCount === this.#selectionLength);

    const beganChange = this.#beginTextChange();

    for (const d of this.textFlow.children.slice(removeStart, removeStart + removeCount)) {
      this.textFlow.remove(d, false);

      this.textContainer.add(d);

      // account for potentially altered height of textbox
      d.y = this.textFlow.boundingBox.y;

      d.hide();
      d.expire();
    }

    const removedText = this.#text.substring(removeStart, removeCount);

    this.#text = this.#text.slice(0, removeStart) + this.#text.slice(removeStart + removeCount);

    // Reorder characters depth after removal to avoid ordering issues with newly added characters.
    for (let i = removeStart; i < this.textFlow.children.length; i++)
      this.textFlow.changeChildDepth(this.textFlow.children[i], this.#getDepthForCharacterIndex(i));

    this.#selectionStart = this.#selectionEnd = removeStart;

    this.#endTextChange(beganChange);
    this.#cursorAndLayout.invalidate();

    return removedText;
  }

  protected getDrawableCharacter(c: string): Drawable {
    return new SpriteText({
      text: c,
      style: {
        fontSize: this.fontSize,
        fill: 0xFFFFFF,
      },
    });
  }

  protected addCharacterToFlow(c: string): Drawable {
    const charsRight = this.textFlow.children.slice(this.#selectionLeft);
    this.textFlow.removeRange(charsRight, false);

    let i = this.#selectionLeft;
    for (const d of charsRight)
      d.depth = this.#getDepthForCharacterIndex(i++);

    const ch = this.getDrawableCharacter(c);
    ch.depth = this.#getDepthForCharacterIndex(this.#selectionLeft);

    this.textFlow.add(ch);

    this.textFlow.addRange(charsRight);

    return ch;
  }

  #getDepthForCharacterIndex(index: number) {
    return -index;
  }

  #customFontSize?: number;

  get fontSize() {
    return this.#customFontSize ?? 14;// this.textFlow.drawSize.y;
  }

  set fontSize(value) {
    // TODO: init only
    this.#customFontSize = value;
  }

  insertString(value: string) {
    this.#insertString(value);
  }

  #insertString(value: string, drawableCreationParameters?: (d: Drawable) => void) {
    if (value === '')
      return;

    if (this.current.disabled) {
      this.notifyInputError();
      return;
    }

    const beganChange = this.#beginTextChange();
    for (const c of value) {
      if (!this.#canAddCharacter(c)) {
        this.notifyInputError();
        continue;
      }

      if (this.#hasSelection)
        this.#removeSelection();

      if (this.lengthLimit !== null && this.#text.length + 1 > this.lengthLimit) {
        this.notifyInputError();
        break;
      }

      const drawable = this.addCharacterToFlow(c);

      drawable.show();
      drawableCreationParameters?.(drawable);

      this.#text = this.#text.slice(0, this.#selectionLeft) + c + this.#text.slice(this.#selectionLeft);
      this.#selectionStart = this.#selectionEnd = this.#selectionLeft + 1;
      this.#ignoreOngoingDragSelection = true;

      this.#cursorAndLayout.invalidate();
    }

    this.#endTextChange(beganChange);
  }

  protected notifyInputError() {}

  protected onUserTextAdded(added: string) {}

  protected onUserTextRemoved(removed: string) {}

  protected onTextCommitted(textChanged: boolean) {}

  protected onCaretMoved(selecting: boolean) {}

  protected onTextSelectionChanged(selectionType: TextSelectionType) {}

  protected onTextDeselected() {}

  #onTextSelectionChanged(selectionType: TextSelectionType, lastSelectionBounds: [number, number]) {
    if (lastSelectionBounds[0] === this.#selectionStart && lastSelectionBounds[1] === this.#selectionEnd)
      return;

    if (this.#hasSelection)
      this.onTextSelectionChanged(selectionType);
    else
      this.#onTextDeselected(lastSelectionBounds);
  }

  #onTextDeselected(lastSelectionBounds: [number, number]) {
    if (lastSelectionBounds[0] === this.#selectionStart && lastSelectionBounds[1] === this.#selectionEnd)
      return;

    if (lastSelectionBounds[0] !== lastSelectionBounds[1])
      this.onTextDeselected();
  }

  #getTextSelectionBounds(): [number, number] {
    return [this.#selectionStart, this.#selectionEnd];
  }

  protected createPlaceholder(): SpriteText {
    return new SpriteText({
      style: {
        fill: 'white',
        fontSize: this.fontSize,
      },
    });
  }

  protected placeholder: SpriteText;

  get placeholderText() {
    return this.placeholder.text;
  }

  set placeholderText(value) {
    this.placeholder.text = value;
  }

  protected abstract createCaret(): Caret;

  #caretVisible = false;

  #updateCaretVisibility() {
    const newVisibility = this.hasFocus;

    if (this.#caretVisible !== newVisibility) {
      this.#caretVisible = newVisibility;

      if (this.#caretVisible)
        this.#caret.show();
      else
        this.#caret.hide();

      this.#cursorAndLayout.invalidate();
    }
  }

  readonly #current = new BindableWithCurrent('');

  get current(): Bindable<string> {
    return this.#current.current;
  }

  set current(value: Bindable<string>) {
    this.#current.current = value;
  }

  #text = '';

  get text(): string {
    return this.#text;
  }

  set text(value: string | null) {
    if (this.current.disabled)
      return;

    if (value === this.#text)
      return;

    this.#lastCommitText = (value ??= '');

    if (value.length === 0)
      this.placeholder.show();
    else
      this.placeholder.hide();

    this.#setText(value);
  }

  #setText(value: string) {
    const beganChange = this.#beginTextChange();

    this.#selectionStart = this.#selectionEnd = 0;

    this.textFlow?.clear();
    this.#text = '';

    this.#insertString(value, d => d.finishTransforms());

    this.#endTextChange(beganChange);
    this.#cursorAndLayout.invalidate();
  }

  get selectedText() {
    return this.#hasSelection ? this.#text.substring(this.#selectionLeft, this.#selectionLeft + this.#selectionLength) : '';
  }

  #textInputBlocking = false;

  // region Input event handling

  override onKeyDown(e: KeyDownEvent): boolean {
    if (this.readonly)
      return true;

    switch (e.key) {
      case Key.Escape:
        if (!e.repeat)
          this.killFocus();
        return true;

      case Key.NumpadEnter:
      case Key.Enter:
        if (e.altPressed)
          return false;

        // same rationale as comment in case statement above.
        if (!e.repeat)
          this.commit();
        return true;

      case Key.Backspace:
      case Key.Delete:
        return false;

      case Key.KeyA:
        if (e.controlPressed)
          return false;
        return true;
    }

    this.#textInputScheduler.update();

    return super.onKeyDown(e) || this.#textInputBlocking;
  }

  protected killFocus() {
    this.#killFocus();
  }

  #killFocus() {
    if (this.getContainingInputManager()?.focusedDrawable === this)
      this.getContainingFocusManager()?.changeFocus(null);
  }

  commit() {
    if (this.releaseFocusOnCommit && this.hasFocus) {
      this.#killFocus();
      if (this.commitOnFocusLost)
        // the commit will happen as a result of the focus loss.
        return;
    }

    const isNew = this.#text !== this.#lastCommitText;
    this.#lastCommitText = this.#text;

    this.onTextCommitted(isNew);
    this.onCommit.emit({ textBox: this, isNew });
  }

  override onKeyUp(e: KeyUpEvent) {
    this.scheduler.addOnce(this.#revertBlockingStateIfRequired, this);
  }

  override onDragStart(e: DragStartEvent): boolean {
    this.#ignoreOngoingDragSelection = false;

    if (this.hasFocus)
      return true;

    const posDiff = e.mouseDownPosition.sub(e.mousePosition);
    return Math.abs(posDiff.x) > Math.abs(posDiff.y);
  }

  override onDrag(e: DragEvent): boolean {
    if (this.readonly)
      return false;

    if (this.#ignoreOngoingDragSelection)
      return false;

    const lastSelectionBounds = this.#getTextSelectionBounds();

    if (this.#doubleClickWord) {
      // select words at a time
      if (this.#getCharacterClosestTo(e.mousePosition) > this.#doubleClickWord[1]) {
        this.#selectionStart = this.#doubleClickWord[0];
        this.#selectionEnd = this.#findSeparatorIndex(this.#text, this.#getCharacterClosestTo(e.mousePosition) - 1, 1);
        this.#selectionEnd = this.#selectionEnd >= 0 ? this.#selectionEnd : this.#text.length;
      }
      else if (this.#getCharacterClosestTo(e.mousePosition) < this.#doubleClickWord[0]) {
        this.#selectionStart = this.#doubleClickWord[1];
        this.#selectionEnd = this.#findSeparatorIndex(this.#text, this.#getCharacterClosestTo(e.mousePosition), -1);
        this.#selectionEnd = this.#selectionEnd >= 0 ? this.#selectionEnd + 1 : 0;
      }
      else {
        // in the middle
        this.#selectionStart = this.#doubleClickWord[0];
        this.#selectionEnd = this.#doubleClickWord[1];
      }
    }
    else {
      if (this.#text.length === 0)
        return false;

      this.#selectionEnd = this.#getCharacterClosestTo(e.mousePosition);
      if (this.#hasSelection)
        this.getContainingFocusManager()!.changeFocus(this);
    }

    this.#cursorAndLayout.invalidate();

    this.#onTextSelectionChanged(this.#doubleClickWord ? TextSelectionType.Word : TextSelectionType.Character, lastSelectionBounds);
    return true;
  }

  override onDoubleClick(e: DoubleClickEvent): boolean {
    const lastSelectionBounds = this.#getTextSelectionBounds();

    if (this.#text.length === 0)
      return true;

    if (this.allowClipboardExport) {
      const hover = Math.min(this.#text.length - 1, this.#getCharacterClosestTo(e.mousePosition));

      const lastSeparator = this.#findSeparatorIndex(this.#text, hover, -1);
      const nextSeparator = this.#findSeparatorIndex(this.#text, hover, 1);

      this.#selectionStart = lastSeparator >= 0 ? lastSeparator + 1 : 0;
      this.#selectionEnd = nextSeparator >= 0 ? nextSeparator : this.#text.length;
    }
    else {
      this.#selectionStart = 0;
      this.#selectionEnd = this.#text.length;
    }

    this.#doubleClickWord = [this.#selectionStart, this.#selectionEnd];

    this.#cursorAndLayout.invalidate();

    this.#onTextSelectionChanged(TextSelectionType.Word, lastSelectionBounds);

    return true;
  }

  #regexAlphanumeric = /[a-z0-9]/i;

  #findSeparatorIndex(input: string, searchPos: number, direction: number) {
    const isLetterOrDigit = this.#regexAlphanumeric.test(input[searchPos]);

    for (let i = searchPos; i >= 0 && i < input.length; i += direction) {
      if (this.#regexAlphanumeric.test(input[i]) !== isLetterOrDigit)
        return i;
    }

    return -1;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (this.readonly)
      return true;

    const lastSelectionBounds = this.#getTextSelectionBounds();

    this.#selectionStart = this.#selectionEnd = this.#getCharacterClosestTo(e.mousePosition);

    this.#cursorAndLayout.invalidate();

    this.#onTextDeselected(lastSelectionBounds);

    return false;
  }

  override onMouseUp(e: MouseUpEvent) {
    this.#doubleClickWord = undefined;
  }

  override onFocusLost(e: FocusLostEvent) {
    this.#unbindInput(e.nextFocused instanceof TextBox ? e.nextFocused : undefined);

    this.#updateCaretVisibility();

    if (this.commitOnFocusLost)
      this.commit();
  }

  override get acceptsFocus(): boolean {
    return true;
  }

  override onClick(e: ClickEvent): boolean {
    if (!this.readonly && this.#textInputBound)
      this.textInput.ensureActivated();

    return !this.readonly;
  }

  override onFocus(e: FocusEvent) {
    this.#bindInput(e.previouslyFocused instanceof TextBox ? e.previouslyFocused : undefined);

    this.#updateCaretVisibility();
  }
  // endregion

  // region native textbox handling

  #textInputBound = false;

  #bindInput(previous?: TextBox) {
    if (this.#textInputBound) {
      this.textInput.ensureActivated();
    }

    if (previous?.textInput === this.textInput) {
      this.textInput.ensureActivated();
    }
    else {
      this.textInput.activate();
    }

    this.textInput.onTextInput.addListener(this.#handleTextInput, this);
    this.textInput.onTextRemoved.addListener(this.#handleTextRemoved, this);

    this.#textInputBound = true;
  }

  #unbindInput(next?: TextBox) {
    if (!this.#textInputBound)
      return;

    this.#textInputBound = false;

    if (this.textInput != null) {
      // see the comment above, in `bindInput(bool)`.
      if (next?.textInput !== this.textInput)
        this.textInput.deactivate();

      this.textInput.onTextInput.removeListener(this.#handleTextInput, this);
      this.textInput.onTextRemoved.removeListener(this.#handleTextRemoved, this);
    }

    // in case keys are held and we lose focus, we should no longer block key events
    this.#textInputBlocking = false;
  }

  #handleTextInput(text: string) {
    this.#textInputScheduler.add(() => {
      this.#textInputBlocking = true;

      this.insertString(text);
      this.onUserTextAdded(text);

      // clear the flag in the next frame if no buttons are pressed/held.
      // needed in case a text event happens without an associated button press (and release).
      // this could be the case for software keyboards, for instance.
      this.scheduler.addOnce(this.#revertBlockingStateIfRequired, this);
    });
  }

  #handleTextRemoved(evt: TextRemovedEvent) {
    this.#textInputScheduler.add(() => {
      this.#selectionStart = evt.start;
      this.#selectionEnd = evt.start + evt.length;
      this.#removeSelection();
    });
  }

  #revertBlockingStateIfRequired() {
    this.#textInputBlocking &&= this.getContainingInputManager()?.currentState.keyboard.keys.hasAnyButtonPressed === true;
  }

  // endregion

  onCommit = new Action<CommitEvent>();

  #lastCommitText = '';
}

export interface CommitEvent {
  textBox: TextBox;
  isNew: boolean;
}
