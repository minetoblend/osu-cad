import { Anchor, Axes, Box, Container, dependencyLoader } from 'osucad-framework';
import { EditorMenubar } from './EditorMenubar';
import { EditorScreenSelect } from './EditorScreenSelect';

export class EditorTopBar extends Container {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.X;
    this.height = 32;
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAll(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
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
