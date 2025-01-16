import type { TimelineHitObjectBlueprintContainer } from '../editor/ui/timeline/hitObjects/TimelineHitObjectBlueprintContainer';
import type { Ruleset } from './Ruleset';
import { EmptyTimelineHitObjectBlueprintContainer } from '../editor/ui/timeline/hitObjects/EmptyTimelineHitObjectBlueprintContainer';

export abstract class EditorRuleset {
  protected constructor(readonly ruleset: Ruleset) {
  }

  createTimelineHitObjectContainer(): TimelineHitObjectBlueprintContainer {
    return new EmptyTimelineHitObjectBlueprintContainer();
  }
}
