import {
  Axes,
  BindableNumber,
  Container,
  dependencyLoader,
  FillDirection,
  FillFlowContainer,
} from 'osucad-framework';
import { AdjustmentButton } from '../../../../userInterface/AdjustmentButton';
import { ControlPointPropertiesSection } from './ControlPointPropertiesSection';
import { LabelledTextBox } from './LabelledTextBox';
import { Metronome } from './Metronome';

export class TimingProperties extends ControlPointPropertiesSection {
  constructor() {
    super('Timing');
  }

  bpm = new BindableNumber(180);

  offset = new BindableNumber(0);

  meter = new BindableNumber(4);

  createContent(): void {
    this.meter.minValue = 1;
    this.meter.precision = 1;

    this.bpm.minValue = 0.01;
    this.bpm.precision = 0.0001;

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
              this.bpm.getBoundCopy(),
            ),
          }),
          this.#bpmText = new LabelledTextBox('BPM').bindToNumber(this.bpm),
          this.#meterText = new LabelledTextBox('Meter').bindToNumber(this.meter),
        ],
      }),
    );

    this.#bpmText.tabbableContentContainer = this;
    this.#meterText.tabbableContentContainer = this;
  }

  #bpmText!: LabelledTextBox;

  #meterText!: LabelledTextBox;
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
