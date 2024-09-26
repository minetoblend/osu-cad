import type { ControlPointGroup } from '../../../../beatmap/timing/ControlPointGroup.ts';
import type { TimingPoint } from '../../../../beatmap/timing/TimingPoint.ts';
import {
  Axes,
  BindableNumber,
  Container,
  dependencyLoader,
  FillDirection,
  FillFlowContainer,
} from 'osucad-framework';
import { AdjustmentButton } from '../../../../userInterface/AdjustmentButton';
import { ControlPointPropertiesSection } from './ControlPointPropertiesSection.ts';
import { LabelledTextBox } from './LabelledTextBox';
import { Metronome } from './Metronome';

export class TimingProperties extends ControlPointPropertiesSection<TimingPoint> {
  constructor() {
    super('Timing');
  }

  readonly beatLength = new BindableNumber(60_000 / 120);

  readonly offset = new BindableNumber(0);

  readonly meter = new BindableNumber(4);

  protected getControlPointFromGroup(group: ControlPointGroup): TimingPoint | null {
    return group.timing;
  }

  protected bindToControlPointGroup(controlPointGroup: ControlPointGroup) {
    super.bindToControlPointGroup(controlPointGroup);

    this.offset.bindTo(controlPointGroup.timeBindable);
  }

  protected unbindFromControlPointGroup(controlPointGroup: ControlPointGroup) {
    super.unbindFromControlPointGroup(controlPointGroup);

    this.offset.unbindFrom(controlPointGroup.timeBindable);
  }

  protected override bindToControlPoint(controlPoint: TimingPoint) {
    this.beatLength.bindTo(controlPoint.beatLengthBindable);
    this.meter.bindTo(controlPoint.meterBindable);
  }

  protected override unbindFromControlPoint(controlPoint: TimingPoint) {
    this.beatLength.unbindFrom(controlPoint.beatLengthBindable);
    this.meter.unbindFrom(controlPoint.meterBindable);
  }

  createContent(): void {
    this.meter.minValue = 1;
    this.meter.precision = 1;

    this.beatLength.minValue = 0.01;

    this.offset.precision = 1;

    this.add(
      new FillFlowContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        direction: FillDirection.Vertical,
        children: [
          new Metronome().with({ padding: { left: 80 } }),
          new Container({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            padding: { left: 80 },
            child: new BpmAdjustment(
              this.offset.getBoundCopy(),
              this.beatLength.getBoundCopy(),
            ),
          }),
          this.#bpmText = new LabelledTextBox('BPM')
            .withTabbableContentContainer(this.tabbableContentContainer),
          this.#meterText = new LabelledTextBox('Meter')
            .bindToNumber(this.meter)
            .withTabbableContentContainer(this.tabbableContentContainer),
        ],
      }),
    );

    this.#bpmText.onCommit.addListener((text) => {
      const value = Number.parseInt(text);
      if (Number.isNaN(value) && value > 0) {
        this.beatLength.value = 60_000 / value;
      }

      this.#updateBpmText();
    });

    this.beatLength.valueChanged.addListener(this.#updateBpmText, this);
    this.#updateBpmText();
  }

  #updateBpmText() {
    const bpm = Math.round(60_000 / this.beatLength.value * 1000) / 1000;

    this.#bpmText.text = bpm.toString();
  }

  #bpmText!: LabelledTextBox;

  #meterText!: LabelledTextBox;

  override createControlPoint(): TimingPoint {
    return this.controlPointInfo.timingPointAt(this.groupTime).deepClone();
  }
}

class BpmAdjustment extends FillFlowContainer {
  constructor(
    readonly offset: BindableNumber,
    readonly bpm: BindableNumber,
  ) {
    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      direction: FillDirection.Horizontal,
    });
  }

  @dependencyLoader()
  load() {
    this.addAll(
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        width: 0.5,
        padding: 4,
        child: new AdjustmentButton({
          size: { x: 1, y: 40 },
          label: 'Offset',
          adjustments: [1, 2, 5, 10],
          bindable: this.offset,
        }).with({
          relativeSizeAxes: Axes.X,
        }),
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        width: 0.5,
        padding: 4,
        child: new AdjustmentButton({
          size: { x: 1, y: 40 },
          label: 'BPM',
          adjustments: [0.1, 0.2, 0.5, 1],
          bindable: this.bpm,
        }).with({
          relativeSizeAxes: Axes.X,
        }),
      }),
    );
  }
}
