import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { Anchor, Axes, BetterBackdropBlurFilter, Box, CompositeDrawable, Container, Dimension, GridContainer, GridSizeMode } from '@osucad/framework';
import { OsucadColors } from '../../OsucadColors';
import { Corner } from '../ui/Corner';
import { EditorCornerPiece } from '../ui/EditorCornerPiece';
import { CurrentTimeDisplay } from './CurrentTimeDisplay';
import { OverviewTimeline } from './OverviewTimeline';
import { PlaybackRateControl } from './PlaybackRateControl';
import { PlayButton } from './PlayButton';

export class EditorBottomBar extends CompositeDrawable {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.X;
    this.height = 48;
    this.anchor = Anchor.BottomLeft;
    this.origin = Anchor.BottomLeft;

    const filter = new BetterBackdropBlurFilter({
      strength: 15,
      quality: 2,
    });

    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.X,
        height: 30,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        padding: { horizontal: 110 },
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: OsucadColors.translucent,
          }),
          new Container({
            relativeSizeAxes: Axes.Both,
            padding: { horizontal: 45 },
            child: new OverviewTimeline(),
          }),
        ],
      }),

      new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        filters: [filter],
        children: [
          new EditorCornerPiece({
            corner: Corner.BottomLeft,
            relativeSizeAxes: Axes.Y,
            width: 140,
            anchor: Anchor.BottomLeft,
            origin: Anchor.BottomLeft,
            padding: { horizontal: 15 },
            child: new CurrentTimeDisplay(),
          }),
          new EditorCornerPiece({
            corner: Corner.BottomRight,
            relativeSizeAxes: Axes.Y,
            width: 200,
            anchor: Anchor.BottomRight,
            origin: Anchor.BottomRight,
            padding: { left: 20, right: 15 },
            child: new GridContainer({
              relativeSizeAxes: Axes.Both,
              rowDimensions: [new Dimension()],
              columnDimensions: [
                new Dimension(GridSizeMode.AutoSize),
                new Dimension(),
              ],
              content: [[
                new PlayButton().with({
                  anchor: Anchor.CenterLeft,
                  origin: Anchor.CenterLeft,
                }),
                new Container({
                  relativeSizeAxes: Axes.Both,
                  padding: { left: 10, right: 34 },
                  children: [
                    new PlaybackRateControl().with({
                      anchor: Anchor.CenterLeft,
                      origin: Anchor.CenterLeft,
                    }),
                  ],
                }),
              ]],
            }),
          }),
        ],
      }),
    );
  }
}
