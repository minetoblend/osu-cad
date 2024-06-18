import { BackdropBlurFilter } from 'pixi-filters';
import { dependencyLoader } from '../../framework/di/DependencyLoader';
import { Anchor } from '../../framework/drawable/Anchor';
import { Axes } from '../../framework/drawable/Axes';
import { ContainerDrawable } from '../../framework/drawable/ContainerDrawable';
import { Corner } from '../../framework/drawable/Corner';
import { EditorCornerPiece } from '../topBar/EditorCornerPiece';
import { OverviewTimeline } from '../bottomBar/OverviewTimeline';
import { MarginPadding } from '../../framework/drawable/MarginPadding';
import { EditorTimestampContainer } from './EditorTimestampContainer';
import { Box } from '../../framework/drawable/Box';
import { PlayButtonContainer } from './PlayButton.ts';

export class EditorBottomBar extends ContainerDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.X;
    this.height = 48;
    this.anchor = Anchor.BottomLeft;
    this.origin = Anchor.BottomLeft;
  }

  @dependencyLoader()
  load() {
    const filter = new BackdropBlurFilter({
      strength: 10,
      padding: 24,
      quality: 3,
      resolution: devicePixelRatio,
      antialias: 'on',
    });
    filter.padding = 32;

    this.add(
      new ContainerDrawable({
        relativeSizeAxes: Axes.X,
        height: 25,
        origin: Anchor.BottomLeft,
        anchor: Anchor.BottomLeft,
        margin: new MarginPadding({ horizontal: 120 }),
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x222228,
            alpha: 0.5,
          }),
          new OverviewTimeline({
            relativeSizeAxes: Axes.Both,
            margin: new MarginPadding({ horizontal: 30 }),
          }),
        ],
      }),
    );

    this.add(
      new EditorCornerPiece(Corner.BottomLeft, {
        width: 140,
        relativeSizeAxes: Axes.Y,
        children: [
          new ContainerDrawable({
            relativeSizeAxes: Axes.Both,
            padding: new MarginPadding({
              top: 6,
              bottom: 6,
              left: 10,
              right: 20,
            }),
            children: [new EditorTimestampContainer()],
          }),
        ],
      }),
    );

    this.add(
      new EditorCornerPiece(Corner.BottomRight, {
        width: 140,
        relativeSizeAxes: Axes.Y,
        anchor: Anchor.BottomRight,
        origin: Anchor.BottomRight,
        children: [
          new ContainerDrawable({
            relativeSizeAxes: Axes.Both,
            padding: new MarginPadding({
              top: 4,
              bottom: 4,
              left: 20,
              right: 10,
            }),
            children: [
              new PlayButtonContainer({
                width: 36,
                height: 36,
                anchor: Anchor.CentreLeft,
                origin: Anchor.CentreLeft,
              }),
            ],
          }),
        ],
      }),
    );

    this.drawNode.filters = [filter];
  }
}
