import { Axes, dependencyLoader, FillDirection, FillFlowContainer } from 'osucad-framework';
import { TimingProperties } from './TimingProperties.ts';

export class TimingPointProperties extends FillFlowContainer {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      direction: FillDirection.Vertical,
    });
  }

  @dependencyLoader()
  load() {
    this.addAllInternal(
      new TimingProperties(),
    );
  }

}
