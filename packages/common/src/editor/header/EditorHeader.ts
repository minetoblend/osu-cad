import { Anchor, Axes, Box, CompositeDrawable } from 'osucad-framework';
import { EditorScreenSelect } from '../ui/EditorScreenSelect';
import { EditorMenubar } from './EditorMenuBar';

export class EditorHeader extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = 32;

    this.internalChildren = [
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
    ];
  }
}
