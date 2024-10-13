import type {
  DependencyContainer,
  ScreenExitEvent,
  ScreenTransitionEvent,
} from 'osucad-framework';
import type { OsuPlayfield } from '../../hitobjects/OsuPlayfield';
import type { BackgroundAdjustment } from '../BackgroundAdjustment';
import {
  Anchor,
  Axes,
  Box,
  Container,
  dependencyLoader,
  DrawSizePreservingFillContainer,
  EasingFunction,
} from 'osucad-framework';
import { LabelWidthProvider } from '../../../userInterface/LabelledDrawable';
import { EditorDependencies } from '../../EditorDependencies';
import { PlayfieldGrid } from '../../playfield/PlayfieldGrid';
import { EditorScreen } from '../EditorScreen';
import { EditorScreenUtils } from '../EditorScreenUtils';
import { HitSoundsScreen } from '../hitsounds/HitSoundsScreen';
import { BackgroundSelectButton } from './BackgroundSelectButton';
import { SetupScreenContainer } from './SetupScreenContainer';

export class SetupScreen extends EditorScreen {
  constructor() {
    super();
  }

  #playfield!: OsuPlayfield;

  #playfieldContainer!: Container;

  #rightContainer!: Container;

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const { reusablePlayfield } = dependencies.resolve(EditorDependencies);

    this.#playfield = reusablePlayfield;

    this.dependencies.provide(new LabelWidthProvider(160));

    this.addAllInternal(
      this.#rightContainer = new Container({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.X,
        width: 0.5,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        padding: {
          horizontal: 30,
          vertical: 100,
        },
        child: new DrawSizePreservingFillContainer({
          targetDrawSize: { x: 512, y: 384 },
          children: [
            this.#playfieldContainer = new Container({
              width: 512,
              height: 384,
              children: [
                this.#grid = new PlayfieldGrid({ customGridSize: 16 }),
              ],
            }),
          ],
        }),
      }),

      this.backgroundSelect = new BackgroundSelectButton(),
      this.#content = new Container({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.X,
        width: 0.5,
        padding: { bottom: -48 },
        x: -0.5,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x222228,
          }),
          new Container({
            relativeSizeAxes: Axes.Both,
            padding: { vertical: 30 },
            child: new SetupScreenContainer(),
          }),
        ],
      }),
    );

    this.#content.moveToX(0, 500, EasingFunction.OutExpo);
  }

  #content!: Container;

  #grid!: PlayfieldGrid;

  backgroundSelect!: BackgroundSelectButton;

  adjustBackground(background: BackgroundAdjustment) {
    background.alpha = 0.5;
    background.width = 0.5;
    background.x = 0.25;
  }

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.backgroundSelect
      .fadeInFromZero(500, EasingFunction.OutQuad)
      .moveToX(0.5)
      .moveToX(0, 500, EasingFunction.OutExpo);

    if (this.#playfield.parent) {
      EditorScreenUtils.matchScreenSpaceDrawQuad(this.#playfield.parent, this.#playfieldContainer, true);
    }
    else {
      this.#rightContainer.fadeInFromZero(500, EasingFunction.OutQuad)
        .moveToX(0.5)
        .moveToX(0, 500, EasingFunction.OutExpo);
    }
    EditorScreenUtils.insertPlayfield(this.#playfield, this.#playfieldContainer);
  }

  onExiting(e: ScreenExitEvent): boolean {
    if (super.onExiting(e))
      return true;

    this.fadeTo(1, 500);

    this.#content.moveToX(e.next instanceof HitSoundsScreen ? -0.7 : -0.5, 500, EasingFunction.OutExpo);

    this.#rightContainer.fadeOut(500, EasingFunction.OutQuad)
      .moveToX(0.5, 500, EasingFunction.OutExpo);

    this.backgroundSelect
      .moveToX(0.5, 500, EasingFunction.OutExpo)
      .fadeOut(300);

    this.#playfieldContainer.fadeOut(500, EasingFunction.OutExpo);

    this.#grid.hide();

    return false;
  }
}
