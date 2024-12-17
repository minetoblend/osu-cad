import type { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import type { ControlPointList } from '../../../controlPoints/ControlPointList';
import type { TimingPoint } from '../../../controlPoints/TimingPoint';
import type { ControlPointLifetimeEntry } from '../../ui/timeline/ControlPointLifetimeEntry';
import { Axes, dependencyLoader, DrawablePool } from 'osucad-framework';
import { ControlPointBlueprintContainer } from '../../ui/timeline/ControlPointBlueprintContainer';
import { TimingPointKeyframeBlueprint } from './TimingPointKeyframeBlueprint';

export class TimingPointKeyframeContainer extends ControlPointBlueprintContainer<TimingPoint, TimingPointKeyframeBlueprint> {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #pool = new DrawablePool(TimingPointKeyframeBlueprint, 10, 20);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(this.#pool);
  }

  protected override getControlPointList(controlPoints: ControlPointInfo): ControlPointList<TimingPoint> {
    return controlPoints.timingPoints;
  }

  override getDrawable(entry: ControlPointLifetimeEntry<TimingPoint>): TimingPointKeyframeBlueprint {
    return this.#pool.get(drawable => drawable.entry = entry);
  }
}
