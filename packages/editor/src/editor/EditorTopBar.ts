import { Anchor, Axes, Container, dependencyLoader } from "osucad-framework";
import { Corner, EditorCornerPiece } from "./EditorCornerPiece";
import { RhythmTimeline } from "./rhythmTimeline/RhythmTimeline";
import {BackdropBlurFilter} from 'pixi-filters'

export class EditorTopBar extends Container {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.X;
    this.height = 84;
  }

  @dependencyLoader()
  init() {
    const filter = new BackdropBlurFilter({
      strength: 15,
      quality: 4,
    })
    filter.padding = 20
    

    this.addAll(
      new Container({
        relativeSizeAxes: Axes.X,
        padding: { horizontal: 190 },
        child: new RhythmTimeline(),
        height: 66,
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        filters: [filter],
        children: [
          new EditorCornerPiece({
            corner: Corner.TopLeft,
            width: 220,
            relativeSizeAxes: Axes.Y,
          }),
          new EditorCornerPiece({
            corner: Corner.TopRight,
            width: 220,
            relativeSizeAxes: Axes.Y,
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
          })
        ]
      })
    )
  }
}