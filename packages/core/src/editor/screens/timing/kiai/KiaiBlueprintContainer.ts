import type { ControlPointInfo, ControlPointList } from '../../../../../src/controlPoints/index';
import type { EffectPoint } from '../../../../controlPoints/EffectPoint';
import type { ControlPointLifetimeEntry } from '../../../ui/timeline/ControlPointLifetimeEntry';
import { dependencyLoader, DrawablePool } from '@osucad/framework';
import { ControlPointBlueprintContainer } from '../../../ui/timeline/ControlPointBlueprintContainer';
import { KiaiSelectionBlueprint } from './KiaiSelectionBlueprint';

export class KiaiBlueprintContainer extends ControlPointBlueprintContainer<EffectPoint, KiaiSelectionBlueprint> {
  constructor() {
    super();
  }

  protected override getControlPointList(controlPoints: ControlPointInfo): ControlPointList<EffectPoint> {
    return controlPoints.effectPoints;
  }

  #pool = new DrawablePool(KiaiSelectionBlueprint, 10, 20);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(this.#pool);
  }

  override getDrawable(entry: ControlPointLifetimeEntry<EffectPoint>): KiaiSelectionBlueprint {
    return this.#pool.get(it => it.entry = entry);
  }
}
