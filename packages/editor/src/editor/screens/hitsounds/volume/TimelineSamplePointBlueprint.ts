import type { SamplePoint } from '../../../../beatmap/timing/SamplePoint';
import type { ControlPointLifetimeEntry } from '../ControlPointLifetimeEntry';
import { Anchor, Axes, Container, dependencyLoader } from 'osucad-framework';
import { PoolableDrawableWithLifetime } from '../../../../pooling/PoolableDrawableWithLifetime';
import { ThemeColors } from '../../../ThemeColors';
import { ControlPointStartTimeAdjustmentBlueprint } from '../ControlPointStartTimeAdjustmentBlueprint';
import { HitSoundsTimeline } from '../HitSoundsTimeline';
import { VolumeAdjustmentBlueprint } from './VolumeAdjustmentBlueprint';

export class TimelineSamplePointBlueprint extends PoolableDrawableWithLifetime<ControlPointLifetimeEntry<SamplePoint>> {
  constructor() {
    super();
  }

  protected timeline!: HitSoundsTimeline;

  #startTimeBlueprint!: ControlPointStartTimeAdjustmentBlueprint;

  #volumeBlueprint!: VolumeAdjustmentBlueprint;

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Y;

    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { vertical: 5 },
        child: this.#volumeBlueprint = new VolumeAdjustmentBlueprint(),
      }),
      this.#startTimeBlueprint = new ControlPointStartTimeAdjustmentBlueprint().with({
        relativePositionAxes: Axes.Y,
        anchor: Anchor.TopLeft,
        color: this.dependencies.resolve(ThemeColors).primary,
      }),
    );
  }

  protected onApply(entry: ControlPointLifetimeEntry<SamplePoint>) {
    super.onApply(entry);

    entry.invalidated.addListener(this.#onInvalidated, this);

    this.#volumeBlueprint.entry = entry;
    this.#startTimeBlueprint.entry = entry;

    this.#onInvalidated();
  }

  protected onFree(entry: ControlPointLifetimeEntry<SamplePoint>) {
    super.onFree(entry);

    this.#volumeBlueprint.entry = null;
    this.#startTimeBlueprint.entry = null;

    entry.invalidated.removeListener(this.#onInvalidated, this);
  }

  #onInvalidated() {
  }

  protected override loadComplete() {
    super.loadComplete();

    this.timeline = this.findClosestParentOfType(HitSoundsTimeline)!;
  }

  override update() {
    super.update();

    const minX = this.timeline.positionAtTime(this.entry!.lifetimeStart);
    const maxX = this.timeline.positionAtTime(this.entry!.lifetimeEnd);

    this.x = minX;
    this.width = Math.min(maxX - minX, 200000);

    this.updateDrawNodeTransform();
  }

  get shouldBeAlive() {
    if (!this.timeline)
      return true;

    return this.time.current >= this.entry!.lifetimeStart - this.timeline.visibleDuration / 2 && this.time.current <= this.entry!.lifetimeEnd + this.timeline.visibleDuration / 2;
  }
}
