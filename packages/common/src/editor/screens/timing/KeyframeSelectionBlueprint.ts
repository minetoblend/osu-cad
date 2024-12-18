import type { Bindable } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import type { ControlPointLifetimeEntry } from '../../ui/timeline/ControlPointLifetimeEntry';
import { Anchor, Axes, dependencyLoader, FillDirection, FillFlowContainer, Vec2 } from 'osucad-framework';
import { KeyframePiece } from './KeyframePiece';
import { TimingScreenSelectionBlueprint } from './TimingScreenSelectionBlueprint';

export abstract class KeyframeSelectionBlueprint<T extends ControlPoint> extends TimingScreenSelectionBlueprint<T> {
  protected constructor() {
    super();

    this.relativeSizeAxes = Axes.Y;
  }

  abstract readonly keyframeColor: Bindable<ColorSource>;

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

  #keyframePiece!: KeyframePiece;

  readonly badgeContainer = new FillFlowContainer({
    autoSizeAxes: Axes.Both,
    direction: FillDirection.Vertical,
    spacing: new Vec2(4),
    anchor: Anchor.CenterLeft,
    margin: 10,
    depth: -1,
  });

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      this.#keyframePiece = new KeyframePiece(this, {
        size: 12,
        anchor: Anchor.CenterLeft,
        origin: Anchor.Center,
      }),
      this.badgeContainer,
    );

    this.#keyframePiece.selected.bindTo(this.selected);
  }
}
