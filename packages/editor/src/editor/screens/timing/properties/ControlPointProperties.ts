import {
  Axes,
  Bindable,
  Container,
  dependencyLoader,
  FillDirection,
  FillFlowContainer,
  resolved,
} from 'osucad-framework';
import { ControlPointSelection } from '../ControlPointSelection.ts';
import { ControlPointFacade } from './ControlPointFacade.ts';
import { DifficultyProperties } from './DifficultyProperties.ts';
import { EffectProperties } from './EffectProperties.ts';
import { LabelledTextBox } from './LabelledTextBox.ts';
import { SampleProperties } from './SampleProperties.ts';
import { TimingProperties } from './TimingProperties.ts';

export class ControlPointProperties extends FillFlowContainer {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      direction: FillDirection.Vertical,
    });
  }

  @resolved(ControlPointSelection)
  selection!: ControlPointSelection;

  #facade!: ControlPointFacade;

  offset = new Bindable<number | null>(null);

  @dependencyLoader()
  load() {
    this.addInternal(this.#facade = new ControlPointFacade());

    this.add(
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: 12,
        child: new LabelledTextBox('Offset'),
      }),
    );

    const timingProperties = new TimingProperties();

    this.add(timingProperties);
    this.add(new DifficultyProperties());
    this.add(new SampleProperties());
    this.add(new EffectProperties());

    this.selection.selectionChanged.addListener(this.#onSelectionChanged, this);
  }

  override dispose(isDisposing: boolean = true) {
    this.selection.selectionChanged.removeListener(this.#onSelectionChanged);

    super.dispose(isDisposing);
  }

  #onSelectionChanged() {
    this.scheduler.addOnce(this.#updateFacade, this);
  }

  #updateFacade() {
    this.#facade.controlPoints = [...this.selection.selection];
  }
}
