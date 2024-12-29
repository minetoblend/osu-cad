import { Anchor, Axes, Box, CompositeDrawable, type ReadonlyDependencyContainer, resolved } from 'osucad-framework';
import { OsucadColors } from '../../../OsucadColors';
import { Timeline } from './Timeline';

export class CurrentTimeOverlay extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #overlay = new Box({
    color: OsucadColors.primary,
    width: 2,
    relativeSizeAxes: Axes.Y,
    origin: Anchor.TopCenter,
    anchor: Anchor.TopCenter,
  });

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.#overlay);
  }

  @resolved(Timeline)
  timeline!: Timeline;
}
