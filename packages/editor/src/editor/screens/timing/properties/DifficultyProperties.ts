import type { ControlPointGroup } from '../../../../beatmap/timing/ControlPointGroup';
import type { DifficultyPoint } from '../../../../beatmap/timing/DifficultyPoint';
import { Axes, BindableNumber, FillDirection, FillFlowContainer } from 'osucad-framework';
import { ControlPointPropertiesSection } from './ControlPointPropertiesSection';
import { LabelledTextBox } from './LabelledTextBox';

export class DifficultyProperties extends ControlPointPropertiesSection<DifficultyPoint> {
  constructor() {
    super('Difficulty');
  }

  sliderVelocity = new BindableNumber(1).withRange(0.1, 10).withPrecision(0.1);

  createContent(): void {
    this.add(
      new FillFlowContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        direction: FillDirection.Vertical,
        children: [
          new LabelledTextBox('Slider Velocity').bindToNumber(this.sliderVelocity),
        ],
      }),
    );
  }

  protected getControlPointFromGroup(group: ControlPointGroup): DifficultyPoint | null {
    return group.difficulty;
  }

  protected bindToControlPoint(controlPoint: DifficultyPoint) {
    this.sliderVelocity.bindTo(controlPoint.sliderVelocityBindable);
  }

  protected unbindFromControlPoint(controlPoint: DifficultyPoint) {
    this.sliderVelocity.unbindFrom(controlPoint.sliderVelocityBindable);
  }

  createControlPoint(): DifficultyPoint {
    return this.controlPointInfo.difficultyPointAt(this.groupTime).deepClone();
  }
}
