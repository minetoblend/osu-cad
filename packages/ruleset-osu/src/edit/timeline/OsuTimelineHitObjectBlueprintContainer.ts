import type { HitObjectLifetimeEntry, TimelineHitObjectBlueprint } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { TimelineHitObjectBlueprintContainer } from '@osucad/core';
import { DrawablePool } from '@osucad/framework';
import { OsuTimelineHitObjectBlueprint } from './OsuTimelineHitObjectBlueprint';

export class OsuTimelineHitObjectBlueprintContainer extends TimelineHitObjectBlueprintContainer {
  #pool = new DrawablePool(OsuTimelineHitObjectBlueprint, 10, 40);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.#pool);
  }

  override getDrawable(entry: HitObjectLifetimeEntry): TimelineHitObjectBlueprint {
    return this.#pool.get((it) => {
      it.entry = entry;
      it.readonly = this.readonly;
    });
  }
}
