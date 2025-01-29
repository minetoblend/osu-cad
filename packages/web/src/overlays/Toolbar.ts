import { OsucadColors } from '@osucad/core';
import { Anchor, Axes, Box, CompositeDrawable, EasingFunction, FillFlowContainer } from '@osucad/framework';
import { ToolbarSettingsButton } from './ToolbarSettingsButton';
import { UserInfoOverlay } from './UserInfoOverlay';

export class Toolbar extends CompositeDrawable {
  static readonly HEIGHT = 38;

  constructor() {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = Toolbar.HEIGHT;

    this.padding = { horizontal: 4, vertical: 2 };

    this.internalChildren = [
      new Box({
        color: OsucadColors.translucent,
        relativeSizeAxes: Axes.Both,
      }),
      new FillFlowContainer({
        relativeSizeAxes: Axes.Y,
        autoSizeAxes: Axes.X,
        children: [
          new ToolbarSettingsButton(),
        ],
      }),
      new FillFlowContainer({
        relativeSizeAxes: Axes.Y,
        autoSizeAxes: Axes.X,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        children: [
          new UserInfoOverlay(),
        ],
      }),
    ];
  }

  override show() {
    this.fadeIn(200)
      .moveToY(0, 200, EasingFunction.OutCubic);
  }

  override hide() {
    this.fadeOut(200)
      .moveToY(-Toolbar.HEIGHT, 200, EasingFunction.OutCubic);
  }
}
