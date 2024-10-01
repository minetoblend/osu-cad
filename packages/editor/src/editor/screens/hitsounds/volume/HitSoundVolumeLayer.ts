import type { Drawable } from 'osucad-framework';
import type { ControlPointInfo } from '../../../../beatmap/timing/ControlPointInfo.ts';
import type { ControlPointList } from '../../../../beatmap/timing/ControlPointList.ts';
import type { SamplePoint } from '../../../../beatmap/timing/SamplePoint.ts';
import type { ControlPointLifetimeEntry } from '../ControlPointLifetimeEntry.ts';
import { dependencyLoader, DrawablePool } from 'osucad-framework';
import { HitSoundControlPointBlueprintContainer } from '../HitSoundControlPointBlueprintContainer.ts';
import { HitSoundsTimelineLayer } from '../HitSoundsTimelineLayer.ts';
import { TimelineSamplePointBlueprint } from './TimelineSamplePointBlueprint.ts';

export class HitSoundVolumeLayer extends HitSoundsTimelineLayer {
  constructor() {
    super('Volume');
  }

  protected createContent(): Drawable {
    return new HitSoundVolumeBlueprintContainer();
  }
}

export class HitSoundVolumeBlueprintContainer extends HitSoundControlPointBlueprintContainer<SamplePoint, TimelineSamplePointBlueprint> {
  constructor() {
    super();
  }

  #pool = new DrawablePool(TimelineSamplePointBlueprint, 10, 20);

  @dependencyLoader()
  load() {
    this.addInternal(this.#pool);
  }

  protected getControlPointList(controlPoints: ControlPointInfo): ControlPointList<SamplePoint> {
    return controlPoints.samplePoints;
  }

  getDrawable(entry: ControlPointLifetimeEntry<SamplePoint>): TimelineSamplePointBlueprint {
    return this.#pool.get(e => e.entry = entry);
  }
}
