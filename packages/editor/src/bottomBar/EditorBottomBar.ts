import { Anchor, Axes, Box, CompositeDrawable, dependencyLoader, Dimension, GridContainer, GridSizeMode } from "@osucad/framework";
import { TimingInfoDisplay } from "./TimingInfoDisplay";
import { PlayButton } from "./PlayButton";
import { OverviewTimeline } from "./OverviewTimeline";
import { ColorProvider } from "../ColorProvider";

export class EditorBottomBar extends CompositeDrawable
{
  public static readonly HEIGHT = 70;

  public constructor()
  {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = EditorBottomBar.HEIGHT;
  }

  @dependencyLoader()
  #load()
  {
    const colorProvider = this.dependencies.resolve(ColorProvider);

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: colorProvider.background5,
        alpha: 0.5,
      }),
      new GridContainer({
        relativeSizeAxes: Axes.Both,
        rowDimensions: [new Dimension()],
        columnDimensions: [
          new Dimension(GridSizeMode.AutoSize),
          new Dimension(GridSizeMode.AutoSize),
          new Dimension(),
        ],
        content: [
          [
            new TimingInfoDisplay().with({
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
            }),
            new PlayButton().with({
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
            }),
            new OverviewTimeline(),
          ],
        ],
      }),
    ];
  }
}
