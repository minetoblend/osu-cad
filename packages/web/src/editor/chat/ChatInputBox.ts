import type { KeyDownEvent } from 'osucad-framework';
import { TextBox } from '@osucad/editor/userInterface/TextBox';
import { Chat } from '@osucad/multiplayer';
import { Axes, EasingFunction, Key, resolved, VisibilityContainer } from 'osucad-framework';

export class ChatInputBox extends VisibilityContainer {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.X;
    this.height = 30;
    this.padding = { top: 4 };

    this.add(this.#textBox = new ChatTextBox().with({
      relativeSizeAxes: Axes.X,
      relativePositionAxes: Axes.Y,
    }).adjust((it) => {
      it.placeholderText = 'Type to chat';
      it.onCommit.addListener(this.#sendChatMessage, this);
    }));
  }

  #sendChatMessage(message: string) {
    this.#textBox.text = '';

    message = message.trim();

    if (message.length === 0)
      return;
    this.chat.send(message);
  }

  @resolved(Chat)
  protected chat!: Chat;

  readonly #textBox!: TextBox;

  protected get startHidden(): boolean {
    return true;
  }

  popIn() {
    this.fadeIn(200);
    this.resizeHeightTo(30, 200, EasingFunction.OutExpo);
  }

  popOut() {
    this.fadeOut(200, EasingFunction.OutQuad);
    this.resizeHeightTo(0, 300, EasingFunction.OutExpo);
  }
}

class ChatTextBox extends TextBox {
  get requestsFocus(): boolean {
    return true;
  }

  clearOnEscape = true;

  commitOnFocusLost = false;

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Escape) {
      this.text = '';
      return false;
    }

    return super.onKeyDown(e);
  }

  onFocusLost() {
    super.onFocusLost();
  }
}
