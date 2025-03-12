import { OsucadColors, OsucadSpriteText, TextBlock } from '@osucad/core';
import { Anchor, Axes, Box, Container, EasingFunction, FillDirection, FillFlowContainer, resolved, Vec2, VisibilityContainer } from '@osucad/framework';
import { LoginButton } from '../editor/LoginButton';
import { PlaceClient } from '../editor/PlaceClient';

export class TutorialDialog extends VisibilityContainer {
  constructor() {
    super();

    this.hide();

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
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: 15,
        children: [
          this.#content = new FillFlowContainer({
            relativeSizeAxes: Axes.Both,
            direction: FillDirection.Vertical,
            spacing: new Vec2(10),
            children: [
              new OsucadSpriteText({
                text: 'How this works',
                fontSize: 16,
                color: OsucadColors.primary,
              }),
              new TextBlock({
                text: `Each user can place an object every 5 minutes.`,
                fontSize: 12,
              }),
            ],
          }),
          new LoginButton().with({
            anchor: Anchor.BottomCenter,
            origin: Anchor.BottomCenter,
          }),
        ],
      }),
    ];
  }

  @resolved(PlaceClient)
  client!: PlaceClient;

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
    this
      .fadeOut(400, EasingFunction.OutQuad)
      .moveToY(100, 300, EasingFunction.OutExpo);

    this.#content
      .fadeOut(400, EasingFunction.OutQuad)
      .moveToY(100, 300, EasingFunction.OutExpo);
  }
}
