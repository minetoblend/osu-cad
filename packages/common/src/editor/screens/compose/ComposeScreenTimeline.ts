import type { DragEndEvent, DragEvent, DragStartEvent, MouseDownEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import { Anchor, Axes, BindableBoolean, Box, Container, isMobile, provide } from 'osucad-framework';
import { OsucadColors } from '../../../OsucadColors';
import { BottomTimelineTickContainer } from '../../ui/timeline/BottomTimelineTickContainer';
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

    this.addAll(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
        alpha: 0.8,
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        height: 20,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        child: new BottomTimelineTickContainer(),
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
      new CurrentTimeOverlay(),
    );

    if (isMobile.any)
      this.add(new ComposeScreenTimelineMobileControls());
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    return true;
  }

  override onDragStart(e: DragStartEvent): boolean {
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    const delta = -this.sizeToDuration(e.delta.x);
    this.editorClock.seek(this.editorClock.currentTime + delta, false);
    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.editorClock.seekSnapped(this.editorClock.currentTime);
  }
}
