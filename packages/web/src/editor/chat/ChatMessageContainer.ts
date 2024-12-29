import type {
  Bindable,
  BindableBoolean,
  MouseDownEvent,
  ScrollContainer,
  Vec2,
} from 'osucad-framework';
import { FastRoundedBox } from '@osucad/editor/drawables/FastRoundedBox';
import { MainScrollContainer } from '@osucad/editor/editor/MainScrollContainer';
import { Chat, type ChatMessage } from '@osucad/multiplayer';
import { Anchor, Axes, BindableNumber, Container, dependencyLoader, EasingFunction, FillDirection, FillFlowContainer, resolved } from 'osucad-framework';
import { DrawableChatMessage } from './DrawableChatMessage';

export class ChatMessageContainer extends Container {
  constructor(active: BindableBoolean) {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = 200;
    this.children = [
      this.#background = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.4,
        cornerRadius: 4,
      }),
      this.#scroll = new MainScrollContainer().with({
        relativeSizeAxes: Axes.X,
        height: 200,
        children: [
          new Container({ height: 200 }),
          this.#content = new FillFlowContainer({
            direction: FillDirection.Vertical,
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            anchor: Anchor.BottomLeft,
            origin: Anchor.BottomLeft,
          }),
        ],
      }),
    ];

    this.#scroll.scrollContent.padding = 6;

    this.#active = active.getBoundCopy();
  }

  readonly #background: FastRoundedBox;

  readonly #content: FillFlowContainer;

  readonly #active: Bindable<boolean>;

  readonly #scroll: ScrollContainer;

  @resolved(Chat)
  protected chat!: Chat;

  @dependencyLoader()
  [Symbol('load')]() {
    this.chat.messageCreated.addListener(this.#onMessageCreated, this);

    this.#active.addOnChangeListener((active) => {
      this.#scroll.scrollbarVisible = active.value;
      this.#scroll.distanceDecayScroll = active.value ? 0.01 : 1;
      this.#scroll.distanceDecayJump = active.value ? 0.01 : 1;
      this.#scroll.clampExtension = active.value ? 80 : 0;

      if (active.value) {
        this.#background.fadeTo(0.4, 200);
      }
      else {
        this.#background.fadeOut(200, EasingFunction.OutQuad);
      }

      this.updateSubTree();

      this.schedule(() => this.#scroll.scrollToEnd(!active.value));
    }, { immediate: true });
  }

  protected loadComplete() {
    super.loadComplete();
    this.finishTransforms(true);
  }

  #onMessageCreated(message: ChatMessage) {
    const wasScrolledToEnd = this.#scroll.isScrolledToEnd(1);

    this.#content.insert(-message.timestamp, new DrawableChatMessage(message, this.#active).with({
      anchor: Anchor.BottomLeft,
      origin: Anchor.BottomLeft,
      y: 30,
    }).doWhenLoaded((it) => {
      it.fadeTo(0.1).fadeIn(200);
    }));

    this.updateSubTree();
    this.updateSubTree();

    if (wasScrolledToEnd)
      this.#scroll.scrollToEnd();
    else
      this.unreadMessagesCount.value++;
  }

  unreadMessagesCount = new BindableNumber();

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.chat.messageCreated.removeListener(this.#onMessageCreated, this);
  }

  onMouseDown(e: MouseDownEvent): boolean {
    return this.#active.value;
  }

  protected receivePositionalInputAtSubTree(screenSpacePos: Vec2): boolean {
    return this.#active.value && super.receivePositionalInputAtSubTree(screenSpacePos);
  }
}
