import type {
  Drawable,
  ScreenExitEvent,
  ScreenTransitionEvent,
} from '../../../framework/src';
import {
  Anchor,
  Axes,
  Box,
  Container,
  dependencyLoader,
  EasingFunction,
  FillDirection,
  FillFlowContainer,
  resolved,
  Screen,
  Vec2,
} from '../../../framework/src';
import { SizeLimitedContainer } from '../drawables/SizeLimitedContainer';
import { ThemeColors } from '../editor/ThemeColors';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { OsucadButton } from '../userInterface/OsucadButton';

export class Dialog extends Screen {
  constructor(readonly title: string) {
    super();
  }

  @resolved(ThemeColors)
  protected colors!: ThemeColors;

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.anchor = this.origin = Anchor.Center;

    this.masking = true;

    this.autoSizeDuration = 500;
    this.autoSizeEasing = EasingFunction.OutExpo;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
      }),
      new SizeLimitedContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        maxWidth: 720,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        child: new FillFlowContainer({
          padding: { vertical: 40 },
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
          direction: FillDirection.Vertical,
          spacing: new Vec2(12),
          width: 0.5,
          anchor: Anchor.Center,
          origin: Anchor.Center,
          children: [
            new Container({
              relativeSizeAxes: Axes.X,
              autoSizeAxes: Axes.Y,
              child: this.#title = this.createTitle(),
            }),
            new Container({
              relativeSizeAxes: Axes.X,
              autoSizeAxes: Axes.Y,
              child: this.mainContent = new Container({
                relativeSizeAxes: Axes.X,
                autoSizeAxes: Axes.Y,
              }),
            }),
            new Container({
              relativeSizeAxes: Axes.X,
              autoSizeAxes: Axes.Y,
              child: this.buttons = new FillFlowContainer({
                autoSizeAxes: Axes.Both,
                spacing: new Vec2(8),
                children: [
                  new OsucadButton().withText('Close').withAction(() => this.exit()),
                ],
              }),
            }),
          ],
        }),
      }),
    ];
  }

  #title!: Drawable;

  onEntering(e: ScreenTransitionEvent) {
    this.#title.moveToX(this.drawWidth).moveToX(0, 400, EasingFunction.OutExpo);
    this.mainContent.moveToX(-this.drawWidth).delay(50).moveToX(0, 400, EasingFunction.OutExpo);
    this.buttons.moveToX(this.drawWidth).delay(100).moveToX(0, 400, EasingFunction.OutExpo);
  }

  onExiting(e: ScreenExitEvent): boolean {
    if (super.onExiting(e))
      return true;

    this.#title.moveToX(this.drawWidth, 400, EasingFunction.OutExpo);
    this.mainContent.delay(50).moveToX(-this.drawWidth, 400, EasingFunction.OutExpo);
    this.buttons.delay(100).moveToX(this.drawWidth, 400, EasingFunction.OutExpo);

    return false;
  }

  protected createTitle(): Drawable {
    return new OsucadSpriteText({
      text: this.title,
      color: this.colors.text,
    });
  }

  mainContent!: Container;

  buttons!: Container;
}
