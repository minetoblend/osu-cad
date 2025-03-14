import type { Drawable, ReadonlyDependencyContainer, ScrollEvent, SpriteText } from '@osucad/framework';
import { BorderLayout, OsucadButton, OsucadColors, OsucadScrollContainer, OsucadSpriteText, OsucadTextBox } from '@osucad/core';
import { Anchor, Axes, Box, CompositeDrawable, Container, Dimension, FillDirection, FillFlowContainer, GridContainer, GridSizeMode, resolved, Scheduler } from '@osucad/framework';
import { PlaceClient } from '../PlaceClient';
import { DrawableChatMessage } from './DrawableChatMessage';

export class Chat extends CompositeDrawable {
  constructor() {
    super();

    this.width = 250;
    this.relativeSizeAxes = Axes.Y;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
      }),
      new BorderLayout({
        center: this.#scroll = new OsucadScrollContainer().with({
          relativeSizeAxes: Axes.Both,
          children: [
            this.#messageFlow = new FillFlowContainer({
              direction: FillDirection.Vertical,
              relativeSizeAxes: Axes.X,
              autoSizeAxes: Axes.Y,
              padding: { left: 8, right: 10, vertical: 10 },
            }),
          ],
        }),
        south: new Container({
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
          children: [
            new Box({
              relativeSizeAxes: Axes.Both,
              color: OsucadColors.translucent,
            }),
            new Container({
              relativeSizeAxes: Axes.X,
              autoSizeAxes: Axes.Y,
              child: new GridContainer({
                relativeSizeAxes: Axes.X,
                autoSizeAxes: Axes.Y,
                padding: 4,
                rowDimensions: [new Dimension(GridSizeMode.AutoSize)],
                columnDimensions: [new Dimension(), new Dimension(GridSizeMode.AutoSize)],
                content: [[
                  this.#textBox = new ChatTextBox().adjust(it => it.onCommit.addListener(this.send, this)),
                  new SendButton().withAction(() => this.send()),
                ]],
              }),
            }),
          ],
        }),
      }),
    ];
  }

  #textBox!: ChatTextBox;

  #scroll!: OsucadScrollContainer;

  #messageFlow!: FillFlowContainer<DrawableChatMessage>;

  @resolved(PlaceClient)
  client!: PlaceClient;

  async send() {
    const text = this.#textBox.text.trim();
    if (text.length === 0)
      return;

    this.#textBox.text = '';

    await this.client.chat.sendMessage(text);
  }

  onScroll(e: ScrollEvent): boolean {
    return true;
  }

  readonly schedulerAfterChildren = new Scheduler();

  protected loadComplete() {
    super.loadComplete();

    this.#scroll.scrollContent.anchor = Anchor.BottomLeft;
    this.#scroll.scrollContent.origin = Anchor.BottomLeft;

    this.client.chat.chatMessageAdded.addListener((message) => {
      const scrolledToEnd = this.#scroll.isScrolledToEnd(5);

      const drawable = new DrawableChatMessage(message, this.#messageFlow.children[this.#messageFlow.children.length - 1]);
      drawable.y = 100;

      this.#messageFlow.add(drawable);
      if (scrolledToEnd || true) {
        drawable.doWhenLoaded(() => {
          if (this.#scroll.availableContent < this.#scroll.displayableContent) {
            this.#scroll.scrollToEnd(false);
            this.#scroll.scrollBy(-drawable.height, false);
          }

          this.schedulerAfterChildren.add(() => {
            this.#scroll.scrollToEnd();
          });
        }, true);
      }
    });
  }

  update() {
    super.update();
  }

  updateAfterChildren() {
    super.updateAfterChildren();

    this.schedulerAfterChildren.update();

    const scrollPosition = Math.max((this.#scroll.drawHeight - this.#messageFlow.drawHeight), 0) - this.#scroll.current;

    for (const child of this.#messageFlow.children) {
      const { drawPosition, drawHeight } = child;

      const y = drawPosition.y + scrollPosition;

      child.scrolledIntoView = y + drawHeight > -50 && y < this.#scroll.drawHeight + 50;
    }
  }
}

class SendButton extends OsucadButton {
  constructor() {
    super();

    this.text = 'Send';
  }

  protected createText(): OsucadSpriteText {
    return new OsucadSpriteText({
      text: this.text,
      fontSize: 12,
      fontWeight: 600,
    });
  }
}

class ChatTextBox extends OsucadTextBox {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.placeholderText = 'Type to chat';
    this.commitOnFocusLost = false;
    this.releaseFocusOnCommit = false;
  }

  get fontSize(): number {
    return 12;
  }

  protected override getFallingChar(c: string): Drawable {
    return new OsucadSpriteText({
      text: c,
      fontSize: this.fontSize,
      fontWeight: 600,
    });
  }

  protected createPlaceholder(): SpriteText {
    return new OsucadSpriteText({
      fontSize: this.fontSize,
      alpha: 0.5,
    });
  }

  protected canAddCharacter(character: string): boolean {
    return super.canAddCharacter(character) && this.text.length < 128;
  }
}
