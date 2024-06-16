import { BackdropBlurFilter } from 'pixi-filters';
import { dependencyLoader } from '../../framework/di/DependencyLoader';
import { Anchor } from '../../framework/drawable/Anchor';
import { Axes } from '../../framework/drawable/Axes';
import { ContainerDrawable } from '../../framework/drawable/ContainerDrawable';
import { Corner } from '../../framework/drawable/Corner';
import { MarginPadding } from '../../framework/drawable/MarginPadding';
import { EditorCornerPiece } from './EditorCornerPiece';
import { RhytmTimeline } from './RhythmTimeline';
import { Box } from '@/framework/drawable/Box.ts';

export class EditorTopBar extends ContainerDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.X;
    this.height = 84;
  }

  @dependencyLoader()
  load() {
    const filter = new BackdropBlurFilter({
      strength: 24,
      padding: 32,
      quality: 5,
      resolution: devicePixelRatio,
      antialias: 'on',
    });
    filter.padding = 32;

    // const timeline = new RhytmTimeline();
    // timeline.relativeSizeAxes = Axes.X;
    // timeline.margin = new MarginPadding({ horizontal: 190 });
    // timeline.height = 60;
    // this.add(timeline);

    this.add(
      new ContainerDrawable({
        relativeSizeAxes: Axes.X,
        height: 60,
        margin: new MarginPadding({ horizontal: 190 }),
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x222228,
            alpha: 0.7,
          }),
          new RhytmTimeline({
            relativeSizeAxes: Axes.Both,
            margin: new MarginPadding({ horizontal: 20 }),
          }),
        ],
      }),
    );

    this.add(
      new EditorCornerPiece(Corner.TopLeft, {
        width: 220,
        relativeSizeAxes: Axes.Y,
      }),
    );

    this.add(
      new EditorCornerPiece(Corner.TopRight, {
        width: 220,
        relativeSizeAxes: Axes.Y,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        children: [],
      }),
    );

    this.drawNode.filters = [filter];
  }
}
