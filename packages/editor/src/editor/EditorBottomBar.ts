import {
  Anchor,
  Axes,
  Container,
  DragEvent,
  DragStartEvent,
  MouseButton,
  dependencyLoader,
} from "osucad-framework";
import { Corner, EditorCornerPiece } from "./EditorCornerPiece";
import { BackdropBlurFilter } from "pixi-filters";
import { OverviewTimeline } from "./overviewTimeline/OverviewTimeline";

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
      quality: 4,
    });
    filter.padding = 20;

    this.addAll(
      new Container({
        relativeSizeAxes: Axes.X,
        height: 40,
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
          }),
          new EditorCornerPiece({
            corner: Corner.BottomRight,
            width: 140,
            relativeSizeAxes: Axes.Y,
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
          }),
        ],
      })
    );
  }

  override onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  override onDrag(e: DragEvent) {
    this.position = this.position.add(e.parentSpaceDelta(this));
    return true;
  }
}
