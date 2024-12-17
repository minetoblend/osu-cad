import type { ControlPointInfo, ControlPointList } from 'packages/common/src/controlPoints';
import type { EffectPoint } from '../../../controlPoints/EffectPoint';
import type { ControlPointLifetimeEntry } from '../../ui/timeline/ControlPointLifetimeEntry';
import { dependencyLoader, DrawablePool } from 'osucad-framework';
import { ControlPointBlueprintContainer } from '../../ui/timeline/ControlPointBlueprintContainer';
import { KiaiBlueprint } from './KiaiBlueprint';

export class KiaiBlueprintContainer extends ControlPointBlueprintContainer<EffectPoint, KiaiBlueprint> {
  constructor() {
    super();
  }

  protected override getControlPointList(controlPoints: ControlPointInfo): ControlPointList<EffectPoint> {
    return controlPoints.effectPoints;
  }

  #pool = new DrawablePool(KiaiBlueprint, 10, 20);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(this.#pool);
  }

  override getDrawable(entry: ControlPointLifetimeEntry<EffectPoint>): KiaiBlueprint {
    return this.#pool.get(it => it.entry = entry);
  }
}
