import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { Anchor, Axes, BindableBoolean, Box, Container, isMobile, provide } from 'osucad-framework';
import { OsucadColors } from '../../../OsucadColors';
import { BottomAlignedTickDisplay } from '../../ui/timeline/BottomAlignedTickDisplay';
import { CurrentTimeOverlay } from '../../ui/timeline/CurrentTimeOverlay';
import { Timeline } from '../../ui/timeline/Timeline';
import { ComposeScreenTimelineHitObjectBlueprintContainer } from './ComposeScreenTimelineHitObjectBlueprintContainer';
import { ComposeScreenTimelineMobileControls } from './ComposeScreenTimelineMobileControls';

@provide(ComposeScreenTimeline)
export class ComposeScreenTimeline extends Timeline {
  readonly interactionEnabled = new BindableBoolean(true);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.addInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
        alpha: 0.8,
        depth: 1,
      }),
    );

    this.addAll(
      new Container({
        relativeSizeAxes: Axes.X,
        height: 10,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        child: new BottomAlignedTickDisplay(),
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        height: 0.5,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        children: [
          new ComposeScreenTimelineHitObjectBlueprintContainer(),
        ],
      }),
    );

    this.addInternal(new CurrentTimeOverlay());

    if (isMobile.any)
      this.add(new ComposeScreenTimelineMobileControls());
  }
}
