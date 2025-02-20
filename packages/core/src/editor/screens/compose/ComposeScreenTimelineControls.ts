import { Anchor, Axes, Container } from '@osucad/framework';
import { Corner } from '../../ui/Corner';
import { EditorCornerContent } from '../../ui/EditorCornerContent';
import { BeatSnapSelector } from './ui/BeatSnapSelector';

export class ComposeScreenTimelineControls extends EditorCornerContent {
  constructor() {
    super(Corner.TopRight);

    this.relativeSizeAxes = Axes.Y;
    this.width = 200;

    this.addRange([
      new Container({
        relativeSizeAxes: Axes.Y,
        width: 180,
        padding: {
          top: 20,
          left: 20,
        },
        anchor: Anchor.TopLeft,
        origin: Anchor.TopLeft,
        child: new BeatSnapSelector(),
      }),
    ]);
  }
}
