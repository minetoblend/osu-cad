import type { ScreenExitEvent, ScreenTransitionEvent } from 'osucad-framework';
import type { BackgroundAdjustment } from '../BackgroundAdjustment.ts';
import { Axes, Box, Container, dependencyLoader, Direction, EasingFunction } from 'osucad-framework';
import { MainScrollContainer } from '../../MainScrollContainer.ts';
import { EditorScreen } from '../EditorScreen';
import { HitSoundsScreen } from '../hitsounds/HitSoundsScreen.ts';
import { BackgroundSelectButton } from './BackgroundSelectButton.ts';

export class SetupScreen extends EditorScreen {
  constructor() {
    super();
  }

  @dependencyLoader()
  load() {
    this.addInternal(this.backgroundSelect = new BackgroundSelectButton());

    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      relativePositionAxes: Axes.X,
      width: 0.6,
      padding: { bottom: -48 },
      x: -0.6,
      children: [
        new Box({
          relativeSizeAxes: Axes.Both,
          color: 0x151517,
        }),
        new Container({
          relativeSizeAxes: Axes.Both,
          padding: { bottom: 30 },
          child: new MainScrollContainer(Direction.Vertical).with({
            relativeSizeAxes: Axes.Both,
            masking: false,
            children: [
              new Container({
                height: 2000,
              }),
            ],
          }),
        }),
      ],
    }));

    this.#content.moveToX(0, 500, EasingFunction.OutExpo);
  }

  #content!: Container;

  backgroundSelect!: BackgroundSelectButton;

  adjustBackground(background: BackgroundAdjustment) {
    background.alpha = 0.5;
    background.width = 0.4;
    background.x = 0.3;
  }

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.backgroundSelect
      .fadeInFromZero(500)
      .moveToY(200)
      .moveToY(0, 500, EasingFunction.OutExpo);
  }

  onExiting(e: ScreenExitEvent): boolean {
    if (super.onExiting(e))
      return true;

    this.fadeTo(1, 500);

    this.#content.moveToX(e.next instanceof HitSoundsScreen ? -0.7 : -0.6, 500, EasingFunction.OutExpo);

    this.backgroundSelect
      .moveToY(100, 500, EasingFunction.OutExpo)
      .fadeOut(300);

    return false;
  }
}
