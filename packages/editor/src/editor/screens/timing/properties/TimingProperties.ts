import { TimingPropertiesSection } from './TimingPropertiesSection.ts';
import { Axes, FillDirection, FillFlowContainer } from 'osucad-framework';
import { Metronome } from './Metronome.ts';

export class TimingProperties extends TimingPropertiesSection {
  constructor() {
    super('Timing');
  }

  createContent(): void {
    this.add(
      new FillFlowContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        direction: FillDirection.Vertical,
        children: [
          new Metronome(),
        ],
      }),
    );
  }
}
