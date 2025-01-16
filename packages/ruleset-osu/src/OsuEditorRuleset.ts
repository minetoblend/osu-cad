import type { TimelineHitObjectBlueprintContainer } from '@osucad/core';
import type { OsuRuleset } from './OsuRuleset';
import { EditorRuleset } from '@osucad/core';
import { OsuTimelineHitObjectBlueprintContainer } from './edit/timeline/OsuTimelineHitObjectBlueprintContainer';

export class OsuEditorRuleset extends EditorRuleset {
  constructor(ruleset: OsuRuleset) {
    super(ruleset);
  }

  override createTimelineHitObjectContainer(): TimelineHitObjectBlueprintContainer {
    return new OsuTimelineHitObjectBlueprintContainer();
  }
}
