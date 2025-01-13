import type { TimelineHitObjectBlueprintContainer } from '@osucad/common';
import type { OsuRuleset } from './OsuRuleset';
import { EditorRuleset } from '@osucad/common';
import { OsuTimelineHitObjectBlueprintContainer } from './edit/timeline/OsuTimelineHitObjectBlueprintContainer';

export class OsuEditorRuleset extends EditorRuleset {
  constructor(ruleset: OsuRuleset) {
    super(ruleset);
  }

  override createTimelineHitObjectContainer(): TimelineHitObjectBlueprintContainer {
    return new OsuTimelineHitObjectBlueprintContainer();
  }
}
