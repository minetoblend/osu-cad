import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import type { ControlPointLifetimeEntry } from '../../ui/timeline/ControlPointLifetimeEntry';
import type { ControlPointSelectionEvent } from './TimingScreenSelectionManager';
import { Axes, BindableBoolean, provide, resolved } from 'osucad-framework';
import { ControlPointBlueprint } from '../../ui/timeline/ControlPointBlueprint';
import { Timeline } from '../../ui/timeline/Timeline';
import { TimingScreenSelectionManager } from './TimingScreenSelectionManager';

@provide(TimingScreenSelectionBlueprint)
export class TimingScreenSelectionBlueprint<T extends ControlPoint> extends ControlPointBlueprint<T> {
  constructor() {
    super();

    this.relativePositionAxes = Axes.Both;
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(Timeline)
  protected timeline!: Timeline;

  readonly selected = new BindableBoolean();

  @resolved(TimingScreenSelectionManager)
  protected selectionManager!: TimingScreenSelectionManager;

  override update() {
    super.update();

    this.x = this.entry!.start.time;
    this.width = this.entry!.lifetimeEnd - this.entry!.lifetimeStart;
  }

  #onSelectionChanged(event: ControlPointSelectionEvent) {
    if (this.controlPoint && this.controlPoint === event.controlPoint) {
      this.selected.value = event.selected;
    }
  }

  protected override onApply(entry: ControlPointLifetimeEntry<T>) {
    super.onApply(entry);

    entry.start.changed.addListener(this.controlPointChanged as any, this);
    this.selectionManager.selectionChanged.addListener(this.#onSelectionChanged, this);

    this.controlPointChanged(entry.start);
  }

  protected override onFree(entry: ControlPointLifetimeEntry<T>) {
    super.onFree(entry);

    entry.start.changed.removeListener(this.controlPointChanged as any, this);
    this.selectionManager.selectionChanged.removeListener(this.#onSelectionChanged, this);
    this.selected.value = false;
  }

  protected controlPointChanged(controlPoint: T) {
  }
}
