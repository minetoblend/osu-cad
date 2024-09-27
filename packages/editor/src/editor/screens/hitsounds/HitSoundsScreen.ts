import type { DependencyContainer, ScreenExitEvent, ScreenTransitionEvent } from 'osucad-framework';
import type { OsuPlayfield } from '../../hitobjects/OsuPlayfield.ts';
import type { BackgroundAdjustment } from '../BackgroundAdjustment.ts';
import {
  Anchor,
  Axes,
  Box,
  Container,
  dependencyLoader,
  DrawSizePreservingFillContainer,
  EasingFunction,
  resolved,
  Vec2,
} from 'osucad-framework';
import { EditorClock } from '../../EditorClock.ts';
import { EditorDependencies } from '../../EditorDependencies.ts';
import { PlayfieldGrid } from '../../playfield/PlayfieldGrid.ts';
import { EditorScreen } from '../EditorScreen.ts';
import { EditorScreenUtils } from '../EditorScreenUtils.ts';

export class HitSoundsScreen extends EditorScreen {
  adjustBackground(background: BackgroundAdjustment) {
    background.size = new Vec2(0.4, 0.5);
    background.y = -0.25;
    background.x = -0.3;
    background.alpha = 0.75;
  }

  #bottomArea!: Container;

  #grid!: PlayfieldGrid;

  mainContent!: Container;

  playfieldContainer!: Container;

  playfield!: OsuPlayfield;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  get playfieldWidth() {
    return 0.35;
  }

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const { reusablePlayfield } = dependencies.resolve(EditorDependencies);

    this.playfield = reusablePlayfield;

    this.addAllInternal(
      this.#playfieldArea = new Container({
        relativeSizeAxes: Axes.Both,
        width: this.playfieldWidth,
        height: 0.4,
        padding: 20,
        child: new DrawSizePreservingFillContainer({
          targetDrawSize: { x: 512, y: 384 },
          children: [
            new Container({
              width: 512,
              height: 384,
              anchor: Anchor.Center,
              origin: Anchor.Center,
              child: this.playfieldContainer = new Container({
                width: 512,
                height: 384,
                children: [
                  this.#grid = new PlayfieldGrid({
                    customGridSize: 32,
                  }),
                ],
              }),
            }),
          ],
        }),
      }),
      this.#topArea = new Container({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.Both,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        width: 1 - this.playfieldWidth,
        height: 0.4,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x151517,
            anchor: Anchor.BottomRight,
            origin: Anchor.BottomRight,
            scale: new Vec2(1, 3),
          }),
        ],
      }),
      this.#bottomArea = new Container({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.Y,
        height: 0.6,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x222228,
          }),
          this.mainContent = new Container({
            relativeSizeAxes: Axes.Both,
            padding: 20,
          }),
        ],
      }),
    );
  }

  #topArea!: Container;

  #playfieldArea!: Container;

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    if (this.playfield.parent) {
      EditorScreenUtils.matchScreenSpaceDrawQuad(this.playfield.parent, this.playfieldContainer, true);
    }
    else {
      this.#playfieldArea
        .resizeTo(1)
        .resizeTo(new Vec2(this.playfieldWidth, 0.4), 500, EasingFunction.OutExpo)
        .fadeInFromZero(500, EasingFunction.OutQuad);
    }

    EditorScreenUtils.insertPlayfield(this.playfield, this.playfieldContainer);

    this.#topArea
      .moveToX(1 - this.playfieldWidth)
      .moveToX(0, 500, EasingFunction.OutExpo)
      .moveToY(0.5)
      .moveToY(0, 500, EasingFunction.OutExpo);

    this.#bottomArea.moveToY(0.5).moveToY(0, 500, EasingFunction.OutExpo);
  }

  onExiting(e: ScreenExitEvent): boolean {
    if (super.onExiting(e))
      return true;

    this.#bottomArea.moveToY(0.5, 500, EasingFunction.OutExpo);

    this.#topArea
      .moveToX(1 - this.playfieldWidth, 500, EasingFunction.OutExpo)
      .moveToY(0.5, 500, EasingFunction.OutExpo);

    this.#grid.alpha = 0;

    return false;
  }

  override get fadeOutDuration() {
    return 500;
  }

  protected get bottomTimelinePadding(): boolean {
    return false;
  }
}
