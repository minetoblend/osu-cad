import {
  Axes,
  Bindable,
  Container,
  dependencyLoader,
  FillDirection,
  FillFlowContainer,
  resolved,
} from 'osucad-framework';
import { ControlPointSelection } from '../ControlPointSelection';
import { ControlPointFacade } from './ControlPointFacade';
import { DifficultyProperties } from './DifficultyProperties';
import { EffectProperties } from './EffectProperties';
import { LabelledTextBox } from './LabelledTextBox';
import { SampleProperties } from './SampleProperties';
import { TimingProperties } from './TimingProperties';

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
