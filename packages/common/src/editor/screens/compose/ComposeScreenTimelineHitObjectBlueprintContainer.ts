import type { Drawable, List, ReadonlyDependencyContainer, Vec2 } from 'osucad-framework';
import { resolved } from 'osucad-framework';
import { TimelineHitObjectBlueprintContainer } from '../../ui/timeline/hitObjects/TimelineHitObjectBlueprintContainer';
import { ComposeScreenTimeline } from './ComposeScreenTimeline';

export class ComposeScreenTimelineHitObjectBlueprintContainer extends TimelineHitObjectBlueprintContainer {
  @resolved(() => ComposeScreenTimeline)
  composeScreenTimeline!: ComposeScreenTimeline;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
  }

  override update() {
    super.update();
  }

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
