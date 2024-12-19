import type { ColorSource } from 'pixi.js';
import type { TimingPoint } from '../../../../controlPoints/TimingPoint';
import type { ControlPointLifetimeEntry } from '../../../ui/timeline/ControlPointLifetimeEntry';
import type { KeyframePiece } from '../KeyframePiece';
import { Bindable, BindableNumber, dependencyLoader, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../../controlPoints/ControlPointInfo';
import { EditorClock } from '../../../EditorClock';
import { KeyframeSelectionBlueprint } from '../KeyframeSelectionBlueprint';
import { TimingScreenNumberBadge } from '../TimingScreenNumberBadge';
import { TimingPointAdjustmentBlueprint } from './TimingPointAdjustmentBlueprint';
import { TimingPointKeyframePiece } from './TimingPointKeyframePiece';

export class TimingPointSelectionBlueprint extends KeyframeSelectionBlueprint<TimingPoint> {
  constructor() {
    super();
  }

  override readonly keyframeColor = new Bindable<ColorSource>(0xFF265A);

  readonly beatLengthBindable = new BindableNumber(100);

  readonly bpmBindable = new BindableNumber(120)
    .withMinValue(1)
    .withMaxValue(10000);

  readonly meterBindable = new BindableNumber(4)
    .withMinValue(1)
    .withMaxValue(12)
    .withPrecision(1);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(
      new TimingPointAdjustmentBlueprint(this),
    );

    this.badgeContainer.addAll(
      new TimingScreenNumberBadge({
        bindable: this.bpmBindable,
        color: this.keyframeColor.value,
        format: value => value.toFixed(2),
        suffix: 'bpm',
      }),
      new TimingScreenNumberBadge({
        bindable: this.meterBindable,
        color: this.keyframeColor.value,
        format: value => value.toFixed(0),
        suffix: '/ 4',
      }),
    );

    this.beatLengthBindable.addOnChangeListener(evt =>
      this.bpmBindable.value = 60_000 / evt.value,
    );

    this.bpmBindable.addOnChangeListener((evt) => {
      if (this.controlPoint)
        this.controlPoint.bpm = evt.value;
    });
  }

  protected override onApply(entry: ControlPointLifetimeEntry<TimingPoint>) {
    super.onApply(entry);

    this.beatLengthBindable.bindTo(entry.start.beatLengthBindable);
    this.meterBindable.bindTo(entry.start.meterBindable);
  }

  protected override onFree(entry: ControlPointLifetimeEntry<TimingPoint>) {
    super.onFree(entry);

    this.beatLengthBindable.unbindFrom(entry.start.beatLengthBindable);
    this.meterBindable.unbindFrom(entry.start.meterBindable);
  }

  protected override controlPointChanged(controlPoint: TimingPoint) {
    super.controlPointChanged(controlPoint);

    this.bpmBindable.value = controlPoint.bpm;
  }

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  @resolved(ControlPointInfo)
  protected controlPointInfo!: ControlPointInfo;

  protected override createKeyframePiece(): KeyframePiece {
    return new TimingPointKeyframePiece(this);
  }
}
