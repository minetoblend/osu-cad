import {
  Anchor,
  Axes,
  Container,
  dependencyLoader,
  MarginPadding,
} from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { Corner, EditorCornerPiece } from './EditorCornerPiece';
import { OverviewTimeline } from './overviewTimeline/OverviewTimeline';
import { TimestampContainer } from './TimestampContainer';
import { PlayButtonContainer } from './PlayButton';

export class EditorBottomBar extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      height: 48,
      anchor: Anchor.BottomLeft,
      origin: Anchor.BottomLeft,
    });
  }

  @dependencyLoader()
  init() {
    const filter = new BackdropBlurFilter({
      strength: 15,
      quality: 2,
      antialias: 'inherit',
      resolution: devicePixelRatio,
    });
    filter.padding = 30;
    filter.repeatEdgePixels = false;

    this.addAll(
      new Container({
        relativeSizeAxes: Axes.X,
        height: 30,
        padding: { horizontal: 120 },
        child: new OverviewTimeline(),
        anchor: Anchor.BottomCenter,
        origin: Anchor.BottomCenter,
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        filters: [filter],
        children: [
          new EditorCornerPiece({
            corner: Corner.BottomLeft,
            width: 140,
            relativeSizeAxes: Axes.Y,
            child: new Container({
              relativeSizeAxes: Axes.Both,
              padding: new MarginPadding({
                top: 5,
                bottom: 5,
                left: 10,
                right: 20,
              }),
              children: [new TimestampContainer()],
            }),
          }),
          new EditorCornerPiece({
            corner: Corner.BottomRight,
            width: 140,
            relativeSizeAxes: Axes.Y,
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
            padding: {
              left: 10,
            },
            children: [
              new Container({
                relativeSizeAxes: Axes.Both,
                child: new PlayButtonContainer(),
              }),
            ],
          }),
        ],
      }),
    );
  }
}
