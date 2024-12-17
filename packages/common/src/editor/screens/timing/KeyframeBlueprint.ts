import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import type { ControlPointLifetimeEntry } from '../../ui/timeline/ControlPointLifetimeEntry';
import { Anchor, Axes, BindableBoolean, dependencyLoader, resolved } from 'osucad-framework';
import { ControlPointBlueprint } from '../../ui/timeline/ControlPointBlueprint';
import { Timeline } from '../../ui/timeline/Timeline';
import { KeyframePiece } from './KeyframePiece';

export abstract class KeyframeBlueprint<T extends ControlPoint> extends ControlPointBlueprint<T> {
  protected constructor() {
    super();

    this.relativeSizeAxes = Axes.Y;
  }

  selected = new BindableBoolean(false);

  @resolved(Timeline)
  protected timeline!: Timeline;

  abstract get keyframeColor(): number;

  protected override onApply(entry: ControlPointLifetimeEntry<T>) {
    super.onApply(entry);

    entry.invalidated.addListener(this.onInvalidated, this);

    this.onInvalidated();
  }

  protected override onFree(entry: ControlPointLifetimeEntry<T>) {
    super.onFree(entry);

    entry.invalidated.removeListener(this.onInvalidated, this);
  }

  onInvalidated() {
  }

  override get lifetimeStart() {
    return -Number.MAX_VALUE;
  }

  override set lifetimeStart(value: number) {
    // ignore
  }

  override get lifetimeEnd() {
    return Number.MAX_VALUE;
  }

  override set lifetimeEnd(value: number) {
    // ignore
  }

  #keyframePiece!: KeyframePiece;

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(this.#keyframePiece = new KeyframePiece(this, {
      size: 12,
      anchor: Anchor.CenterLeft,
      origin: Anchor.Center,
    }));

    this.#keyframePiece.selected.bindTo(this.selected);
  }

  override update() {
    super.update();

    this.x = this.timeline.timeToPosition(this.entry!.lifetimeStart);
    this.width = Math.min(
      this.timeline.durationToSize(this.entry!.lifetimeEnd - this.entry!.lifetimeStart),
      20_000,
    );
  }
}
