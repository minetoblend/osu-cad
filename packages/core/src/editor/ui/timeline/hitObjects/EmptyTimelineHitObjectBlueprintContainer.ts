import type { HitObjectLifetimeEntry } from '../../../../../src/hitObjects';
import { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { TimelineHitObjectBlueprintContainer } from './TimelineHitObjectBlueprintContainer';

export class EmptyTimelineHitObjectBlueprintContainer extends TimelineHitObjectBlueprintContainer {
  override getDrawable(entry: HitObjectLifetimeEntry): TimelineHitObjectBlueprint {
    return new TimelineHitObjectBlueprint();
  }
}
