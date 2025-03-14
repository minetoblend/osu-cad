import type { IChatMessage } from './ChatManager';
import { OsucadColors, OsucadSpriteText, TextBlock } from '@osucad/core';
import { Anchor, Axes, CompositeDrawable, FillDirection, FillFlowContainer, Vec2 } from '@osucad/framework';
import { UserAvatar } from '../UserAvatar';

export class DrawableChatMessage extends CompositeDrawable {
  constructor(readonly message: IChatMessage) {
    super();

    this.relativeSizeAxes = Axes.X;

    this.internalChildren = [
      new FillFlowContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        direction: FillDirection.Vertical,
        children: [
          new FillFlowContainer({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            spacing: new Vec2(4),
            children: [
              new UserAvatar({
                size: 18,
                anchor: Anchor.CenterLeft,
                origin: Anchor.CenterLeft,
              }).adjust(it => it.userId.value = message.user.id),
              this.username = new OsucadSpriteText({
                text: message.user.username,
                fontSize: 12,
                fontWeight: 600,
                color: OsucadColors.primary,
                anchor: Anchor.CenterLeft,
                origin: Anchor.CenterLeft,
              }),
            ],
          }),
          this.content = new TextBlock({
            text: message.content,
            fontWeight: 500,
            fontSize: 11,
          }),
        ],
      }),
    ];
  }

  username!: OsucadSpriteText;
  content!: OsucadSpriteText;

  #scrolledIntoView = true;

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

    for (let i = 0; i < 2; i++)
      this.internalChild.updateSubTree();

    this.height = this.username.drawHeight + this.content.drawHeight;
  }
}
