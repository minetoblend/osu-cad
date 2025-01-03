import type { EditorActionContainer } from '@osucad/editor/editor/EditorActionContainer';
import type {
  Drawable,
  IKeyBindingHandler,
  KeyBindingPressEvent,
  KeyDownEvent,
  List,
} from 'osucad-framework';
import { EditorAction } from '@osucad/editor/editor/EditorAction';
import { Chat } from '@osucad/multiplayer';
import {
  Anchor,
  Axes,
  BindableBoolean,
  Container,
  dependencyLoader,
  FillDirection,
  FillFlowContainer,
  Key,
  MarginPadding,
  resolved,
} from 'osucad-framework';
import { ChatInputBox } from './ChatInputBox';
import { ChatMessageContainer } from './ChatMessageContainer';

export class ChatOverlay extends Container implements IKeyBindingHandler<EditorActionContainer> {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = 400;
    this.origin = Anchor.BottomLeft;

    this.padding = new MarginPadding({ horizontal: 72, bottom: 10 });

    this.internalChild = new FillFlowContainer({
      direction: FillDirection.Vertical,
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      anchor: Anchor.BottomLeft,
      origin: Anchor.BottomLeft,
      children: [
        new ChatMessageContainer(this.active),
        this.#inputBox = new ChatInputBox(),
      ],
    });
  }

  #inputBox!: ChatInputBox;

  active = new BindableBoolean();

  @resolved(Chat)
  protected chat!: Chat;

  @dependencyLoader()
  [Symbol('load')]() {
    this.active.addOnChangeListener((active) => {
      if (active.value)
        this.#inputBox.show();
      else
        this.#inputBox.hide();
    });
  }

  override buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking?: boolean): boolean {
    if (this.active.value) {
      queue.clear();
    }

    return super.buildNonPositionalInputQueue(queue, allowBlocking);
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: EditorAction) {
    return binding instanceof EditorAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorActionContainer>): boolean {
    if (e.pressed === EditorAction.ShowChat) {
      this.active.toggle();
      return true;
    }
    return false;
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Escape && this.active.value) {
      this.active.value = false;
      return true;
    }
    return false;
  }
}
