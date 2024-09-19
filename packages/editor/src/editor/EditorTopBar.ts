import { Anchor, Axes, Box, Container, dependencyLoader } from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { EditorMenubar } from './EditorMenubar';
import { EditorScreenSelect } from './EditorScreenSelect';
import { Timeline } from './timeline/Timeline';

export class EditorTopBar extends Container {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.X;
    this.height = 28;
  }

  @dependencyLoader()
  init() {
    const filter = new BackdropBlurFilter({
      strength: 15,
      quality: 3,
      antialias: 'inherit',
      resolution: devicePixelRatio,
    });
    filter.padding = 30;

    const timeline = new Timeline();

    this.addAll(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.9,
        filters: [filter],
      }),
      new EditorMenubar(),
      new EditorScreenSelect().with({
        autoSizeAxes: Axes.X,
        relativeSizeAxes: Axes.Y,
        anchor: Anchor.TopCenter,
        origin: Anchor.TopCenter,
      }),
    );
  }
}
