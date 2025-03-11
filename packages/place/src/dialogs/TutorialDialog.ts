import type { Container } from '@osucad/framework';
import { OsucadColors, OsucadSpriteText } from '@osucad/core';
import { Anchor, Axes, BetterBackdropBlurFilter, Box, CompositeDrawable, FillDirection, FillFlowContainer } from '@osucad/framework';

export class TutorialDialog extends CompositeDrawable {
  constructor() {
    super();

    this.anchor = this.origin = Anchor.Center;
    this.masking = true;
    this.cornerRadius = 8;

    this.width = 600;
    this.height = 500;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
        alpha: 0.8,
        filters: [
          new BetterBackdropBlurFilter({
            strength: 15,
            quality: 3,
            resolution: 2,
            antialias: 'inherit',
          }),
        ],
      }),
      this.#content = new FillFlowContainer({
        relativeSizeAxes: Axes.Both,
        direction: FillDirection.Vertical,
        padding: 15,
        children: [
          new OsucadSpriteText({
            text: 'Welcome to osucad place',
            fontSize: 20,
          }),
        ],
      }),
    ];
    // this.hide();
  }

  #content!: Container;

  // popIn(): void {
  //   this
  //     .fadeInFromZero(400, EasingFunction.OutQuad)
  //     .moveToY(100)
  //     .moveToY(0, 650, EasingFunction.OutExpo);
  //
  //   this.#content
  //     .fadeInFromZero(400, EasingFunction.OutQuad)
  //     .moveToY(100)
  //     .moveToY(0, 650, EasingFunction.OutExpo);
  // }
  //
  // popOut(): void {
  // }
  //
  // protected override loadComplete() {
  //   super.loadComplete();
  //
  //   this.show();
  // }
}
