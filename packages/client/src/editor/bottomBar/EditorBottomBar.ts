import { BackdropBlurFilter } from 'pixi-filters';
import { dependencyLoader } from '../../framework/di/DependencyLoader';
import { Anchor } from '../../framework/drawable/Anchor';
import { Axes } from '../../framework/drawable/Axes';
import { ContainerDrawable } from '../../framework/drawable/ContainerDrawable';
import { Corner } from '../../framework/drawable/Corner';
import { EditorCornerPiece } from '../topBar/EditorCornerPiece';
import { OverviewTimeline } from '../topBar/OverviewTimeline';
import { MarginPadding } from '../../framework/drawable/MarginPadding';
import { EditorTimestampContainer } from './EditorTimestampContainer';
import { Box } from '../../framework/drawable/Box';

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
      strength: 24,
      padding: 24,
      quality: 4,
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
            alpha: 0.7,
          }),
          new OverviewTimeline({
            relativeSizeAxes: Axes.Both,
            margin: new MarginPadding({ horizontal: 30 }),
          }),
        ],
      }),
    );

    const timeline = new OverviewTimeline();
    timeline.relativeSizeAxes = Axes.X;
    timeline.margin = new MarginPadding({ horizontal: 120 });
    timeline.height = 25;
    this.add(timeline);
    timeline.anchor = Anchor.BottomLeft;
    timeline.origin = Anchor.BottomLeft;

    this.add(
      new EditorCornerPiece(Corner.BottomLeft, {
        width: 140,
        relativeSizeAxes: Axes.Y,
        children: [
          new ContainerDrawable({
            relativeSizeAxes: Axes.Both,
            padding: new MarginPadding({
              top: 4,
              bottom: 4,
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
          }),
        ],
      }),
    );

    this.drawNode.filters = [filter];
  }
}
