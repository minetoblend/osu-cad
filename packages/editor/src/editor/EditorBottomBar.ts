import {
  Anchor,
  Axes,
  Container,
  MarginPadding,
  dependencyLoader,
} from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { Corner, EditorCornerPiece } from './EditorCornerPiece';
import { OverviewTimeline } from './overviewTimeline/OverviewTimeline';
import { TimestampContainer } from './TimestampContainer';
import { PlayButtonContainer } from './PlayButton';
import { ConnectedUsersOverlay } from './online/ConnectedUsersOverlay';

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
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: { right: 10, bottom: 54 },
        child: new ConnectedUsersOverlay(),
        anchor: Anchor.BottomRight,
        origin: Anchor.BottomRight,
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
