import type { ChatMessage } from '@osucad/multiplayer';
import type {
  Bindable,
  Container,
} from 'osucad-framework';
import { ThemeColors } from '@osucad/editor';
import { OsucadSpriteText } from '@osucad/editor/OsucadSpriteText';
import {
  Axes,
  BindableBoolean,
  CompositeDrawable,
  dependencyLoader,
  EasingFunction,
  FillFlowContainer,
  resolved,
  Vec2,
} from 'osucad-framework';

export class DrawableChatMessage extends CompositeDrawable {
  constructor(
    readonly message: ChatMessage,
    chatBoxActive: Bindable<boolean>,
  ) {
    super();

    this.#chatBoxActive = chatBoxActive.getBoundCopy();

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;
  }

  readonly #chatBoxActive: Bindable<boolean>;

  readonly #hidden = new BindableBoolean();

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    const timestamp = new Date(this.message.timestamp);

    this.alwaysPresent = true;

    this.internalChild = this.#content = new FillFlowContainer({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      spacing: new Vec2(4),
      children: [
        new OsucadSpriteText({
          text: timestamp.toLocaleTimeString('en-US', {
            timeStyle: 'short',
            hour12: false,
          }),
          color: this.colors.text,
        }),
        new OsucadSpriteText({
          text: this.message.user.username,
          color: this.colors.primary,
        }),
        new OsucadSpriteText({
          text: this.message.content,
        }),
      ],
    });

    this.#chatBoxActive.valueChanged.addListener(this.#updateVisibility, this);
    this.#hidden.valueChanged.addListener(this.#updateVisibility, this);
  }

  #content!: Container;

  #updateVisibility() {
    if (!this.#hidden.value || this.#chatBoxActive.value) {
      if (this.#content.alpha === 0)
        this.#content.fadeTo(0.1);
      this.#content.fadeIn(200);
      this.autoSizeAxes = Axes.Y;
    }
    else {
      this.#content.fadeOut(200, EasingFunction.OutQuad);
      this.autoSizeAxes = Axes.None;
    }
  }

  protected loadComplete() {
    super.loadComplete();

    this.scheduler.addDelayed(() => {
      this.#hidden.value = true;
    }, 10000);
  }
}
