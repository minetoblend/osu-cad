import type {
  DependencyContainer,
} from 'osucad-framework';
import type { EditorBackground } from '../../EditorBackground.ts';
import {
  Axes,
  Box,
  Container,
  dependencyLoader,
  Direction,
  EasingFunction,
} from 'osucad-framework';
import { MainScrollContainer } from '../../MainScrollContainer.ts';
import { EditorScreen } from '../EditorScreen';
import { BackgroundSelectButton } from './BackgroundSelectButton.ts';

export class SetupScreen extends EditorScreen {
  constructor() {
    super();
  }

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    this.addInternal(this.backgroundSelect = new BackgroundSelectButton());

    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      relativePositionAxes: Axes.X,
      width: 0.6,
      height: 1.1,
      x: -0.6,
      children: [
        new Box({
          relativeSizeAxes: Axes.Both,
          color: 0x151517,
        }),
        new MainScrollContainer(Direction.Vertical).with({
          relativeSizeAxes: Axes.Both,
          children: [
            new Container({
              height: 2000,
            }),
          ],
        }),
      ],
    }));

    this.#content.moveToX(0, 500, EasingFunction.OutExpo);
  }

  #content!: Container;

  backgroundSelect!: BackgroundSelectButton;

  adjustBackground(background: EditorBackground) {
    background.fadeTo(0.5, 500, EasingFunction.OutQuad);
    background.scaleTo(1.2, 500, EasingFunction.OutExpo);

    background.resizeWidthTo(0.35, 500, EasingFunction.OutExpo);
    background.moveToX(0.3, 500, EasingFunction.OutExpo);
  }

  protected override get fadeInDuration() {
    return 0;
  }

  show() {
    this.backgroundSelect
      .fadeInFromZero(500)
      .moveToY(200)
      .moveToY(0, 500, EasingFunction.OutExpo);
  }

  hide() {
    this.fadeTo(1, 500);

    this.#content.moveToX(-0.6, 500, EasingFunction.OutExpo);

    this.backgroundSelect
      .moveToY(100, 500, EasingFunction.OutExpo)
      .fadeOut(300);

    this.editor.applyToBackground((background) => {
      background.moveToX(0, 500, EasingFunction.OutExpo);
      background.resizeWidthTo(1, 500, EasingFunction.OutExpo);
    });
  }
}
