import type { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import type { ControlPointList } from '../../../controlPoints/ControlPointList';
import type { DifficultyPoint } from '../../../controlPoints/DifficultyPoint';
import type { ControlPointLifetimeEntry } from '../../ui/timeline/ControlPointLifetimeEntry';
import { Axes, dependencyLoader, DrawablePool } from 'osucad-framework';
import { ControlPointBlueprintContainer } from '../../ui/timeline/ControlPointBlueprintContainer';
import { SliderVelocityKeyframeBlueprint } from './SliderVelocityKeyframeBlueprint';

export class SliderVelocityKeyframeContainer extends ControlPointBlueprintContainer<DifficultyPoint, SliderVelocityKeyframeBlueprint> {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #pool = new DrawablePool(SliderVelocityKeyframeBlueprint, 10, 20);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(this.#pool);
  }

  protected override getControlPointList(controlPoints: ControlPointInfo): ControlPointList<DifficultyPoint> {
    return controlPoints.difficultyPoints;
  }

  override getDrawable(entry: ControlPointLifetimeEntry<DifficultyPoint>): SliderVelocityKeyframeBlueprint {
    return this.#pool.get(drawable => drawable.entry = entry);
  }
}
