import type { ControlPointInfo } from '../../../../controlPoints/ControlPointInfo';
import type { ControlPointList } from '../../../../controlPoints/ControlPointList';
import type { DifficultyPoint } from '../../../../controlPoints/DifficultyPoint';
import type { ControlPointLifetimeEntry } from '../../../ui/timeline/ControlPointLifetimeEntry';
import { Axes, dependencyLoader, DrawablePool } from 'osucad-framework';
import { ControlPointBlueprintContainer } from '../../../ui/timeline/ControlPointBlueprintContainer';
import { SliderVelocitySelectionBlueprint } from './SliderVelocitySelectionBlueprint';

export class SliderVelocityBlueprintContainer extends ControlPointBlueprintContainer<DifficultyPoint, SliderVelocitySelectionBlueprint> {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #pool = new DrawablePool(SliderVelocitySelectionBlueprint, 10, 20);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(this.#pool);
  }

  protected override getControlPointList(controlPoints: ControlPointInfo): ControlPointList<DifficultyPoint> {
    return controlPoints.difficultyPoints;
  }

  override getDrawable(entry: ControlPointLifetimeEntry<DifficultyPoint>): SliderVelocitySelectionBlueprint {
    return this.#pool.get(drawable => drawable.entry = entry);
  }
}
