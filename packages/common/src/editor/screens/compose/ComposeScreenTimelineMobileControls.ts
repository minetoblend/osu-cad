import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { Toggle } from '@osucad/editor/userInterface/Toggle';
import { Axes, Box, CompositeDrawable, resolved } from 'osucad-framework';
import { ComposeScreenTimeline } from './ComposeScreenTimeline';

export class ComposeScreenTimelineMobileControls extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.width = 100;
    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
      }),
    ];
  }

  @resolved(() => ComposeScreenTimeline)
  timeline!: ComposeScreenTimeline;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
    this.addInternal(new Toggle({
      bindable: this.timeline.interactionEnabled,
    }));
  }
}
