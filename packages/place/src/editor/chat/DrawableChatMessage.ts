import type { Container } from '@osucad/framework';
import type { IChatMessage } from './ChatManager';
import { OsucadColors, OsucadSpriteText, TextBlock } from '@osucad/core';
import { Anchor, Axes, CompositeDrawable, Dimension, FillDirection, FillFlowContainer, GridContainer, GridSizeMode } from '@osucad/framework';
import { UserAvatar } from '../UserAvatar';

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);

  return [
    date.getHours(),
    date.getMinutes(),
  ].map(it => it < 10 ? `0${it}` : it.toString()).join(':');
}

export class DrawableChatMessage extends CompositeDrawable {
  constructor(readonly message: IChatMessage, previousMessage?: DrawableChatMessage) {
    super();

    this.relativeSizeAxes = Axes.X;

    this.internalChildren = [
      this.#content = new FillFlowContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        direction: FillDirection.Vertical,
      }),
    ];

    if (previousMessage?.message.user.id !== message.user.id) {
      this.padding = { top: 10 };

      this.#content.addRange([
        this.#header = new GridContainer({
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
          rowDimensions: [new Dimension(GridSizeMode.AutoSize)],
          columnDimensions: [
            new Dimension(GridSizeMode.AutoSize),
            new Dimension(),
            new Dimension(GridSizeMode.AutoSize),
          ],
          content: [
            [
              new UserAvatar({
                size: 18,
                anchor: Anchor.CenterLeft,
                origin: Anchor.CenterLeft,
              }).adjust(it => it.userId.value = message.user.id),
              new OsucadSpriteText({
                text: message.user.username,
                fontSize: 12,
                fontWeight: 600,
                color: OsucadColors.primary,
                anchor: Anchor.CenterLeft,
                origin: Anchor.CenterLeft,
              }),
              new OsucadSpriteText({
                text: formatTimestamp(message.timestamp),
                fontSize: 10,
                alpha: 0.5,
                anchor: Anchor.CenterRight,
                origin: Anchor.CenterRight,
              }),
            ],
          ],
        }),
      ]);
    }

    this.#content.add(
      this.#messageText = new TextBlock({
        text: message.content,
        fontWeight: 500,
        fontSize: 11,
      }),
    );
  }

  #messageText: OsucadSpriteText;
  #scrolledIntoView = true;
  #content: Container;
  #header?: GridContainer;

  get scrolledIntoView() {
    return this.#scrolledIntoView;
  }

  set scrolledIntoView(value) {
    if (this.#scrolledIntoView === value)
      return;

    this.#scrolledIntoView = value;
    if (value)
      this.internalChild.fadeIn(100);
    else
      this.internalChild.fadeOut(100);
  }

  protected loadComplete() {
    super.loadComplete();

    for (let i = 0; i < 4; i++)
      this.internalChild.updateSubTree();

    this.height = (this.#header?.drawHeight ?? 0) + this.#messageText.drawHeight + this.padding.totalVertical;
  }
}
