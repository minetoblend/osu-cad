import type { ControlPointGroup, SamplePoint } from '@osucad/common';
import { SampleSet } from '@osucad/common';
import { Axes, Bindable, BindableNumber, FillDirection, FillFlowContainer, Vec2 } from 'osucad-framework';
import { ControlPointPropertiesSection } from './ControlPointPropertiesSection';
import { LabelledTextBox } from './LabelledTextBox';
import { SampleSetSelect } from './SampleSetSelect';

export class SampleProperties extends ControlPointPropertiesSection<SamplePoint> {
  constructor() {
    super('Hitsounds');
  }

  volume = new BindableNumber(100);

  sampleSet = new Bindable(SampleSet.Auto);

  createContent(): void {
    this.add(
      new FillFlowContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        direction: FillDirection.Vertical,
        spacing: new Vec2(4),
        children: [
          new LabelledTextBox('Volume')
            .bindToNumber(this.volume)
            .withTabbableContentContainer(this.tabbableContentContainer),
          new SampleSetSelect({ relativeSizeAxes: Axes.X, height: 30 })
            .withBackgroundColor(0x3C3C47)
            .withCurrent(this.sampleSet)
            .withTabbableContentContainer(this.tabbableContentContainer),
        ],
      }),
    );
  }

  protected bindToControlPoint(controlPoint: SamplePoint) {
    this.volume.bindTo(controlPoint.volumeBindable);
    this.sampleSet.bindTo(controlPoint.sampleSetBindable);
  }

  protected unbindFromControlPoint(controlPoint: SamplePoint) {
    this.volume.unbindFrom(controlPoint.volumeBindable);
    this.sampleSet.unbindFrom(controlPoint.sampleSetBindable);
  }

  protected getControlPointFromGroup(group: ControlPointGroup): SamplePoint | null {
    return group.sample;
  }

  createControlPoint(): SamplePoint {
    return this.controlPointInfo.samplePointAt(this.groupTime).deepClone();
  }
}
