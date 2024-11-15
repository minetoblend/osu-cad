import type { ControlPointInfo, ControlPointList, SamplePoint } from '@osucad/common';
import type { Drawable } from 'osucad-framework';
import type { ControlPointLifetimeEntry } from '../ControlPointLifetimeEntry';
import { dependencyLoader, DrawablePool } from 'osucad-framework';
import { HitSoundControlPointBlueprintContainer } from '../HitSoundControlPointBlueprintContainer';
import { HitSoundsTimelineLayer } from '../HitSoundsTimelineLayer';
import { TimelineSamplePointBlueprint } from './TimelineSamplePointBlueprint';

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
