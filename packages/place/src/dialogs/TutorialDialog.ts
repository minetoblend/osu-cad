import type { Container } from '@osucad/framework';
import { OsucadColors, OsucadSpriteText, TextBlock } from '@osucad/core';
import { Anchor, Axes, Box, EasingFunction, FillDirection, FillFlowContainer, Vec2, VisibilityContainer } from '@osucad/framework';

export class TutorialDialog extends VisibilityContainer {
  constructor() {
    super();

    this.anchor = this.origin = Anchor.Center;
    this.masking = true;
    this.cornerRadius = 8;

    this.width = 500;
    this.height = 350;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
        alpha: 0.95,
      }),
      this.#content = new FillFlowContainer({
        relativeSizeAxes: Axes.Both,
        direction: FillDirection.Vertical,
        padding: 15,
        spacing: new Vec2(10),
        children: [
          new OsucadSpriteText({
            text: 'How this works',
            fontSize: 16,
          }),
          new TextBlock({
            text: `Every 5 minutes you can place a new object.`,
            fontSize: 12,
          }),
        ],
      }),
    ];
    this.hide();
  }

  #content!: Container;

  popIn(): void {
    this
      .fadeInFromZero(400, EasingFunction.OutQuad)
      .moveToY(100)
      .moveToY(0, 650, EasingFunction.OutExpo);

    this.#content
      .fadeInFromZero(400, EasingFunction.OutQuad)
      .moveToY(100)
      .moveToY(0, 650, EasingFunction.OutExpo);
  }

  popOut(): void {
  }

  protected override loadComplete() {
    super.loadComplete();

    this.show();
  }
}
