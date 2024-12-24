import { type Drawable, type List, resolved, type Vec2 } from 'osucad-framework';
import { TimelineHitObjectBlueprintContainer } from '../../ui/timeline/hitObjects/TimelineHitObjectBlueprintContainer';
import { ComposeScreenTimeline } from './ComposeScreenTimeline';

export class ComposeScreenTimelineHitObjectBlueprintContainer extends TimelineHitObjectBlueprintContainer {
  @resolved(() => ComposeScreenTimeline)
  composeScreenTimeline!: ComposeScreenTimeline;

  override buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking?: boolean): boolean {
    if (!this.composeScreenTimeline.interactionEnabled.value)
      return false;

    return super.buildNonPositionalInputQueue(queue, allowBlocking);
  }

  override buildPositionalInputQueue(screenSpacePos: Vec2, queue: List<Drawable>): boolean {
    if (!this.composeScreenTimeline.interactionEnabled.value)
      return false;

    return super.buildPositionalInputQueue(screenSpacePos, queue);
  }
}
