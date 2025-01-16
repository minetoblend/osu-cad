import type { Bindable } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import type { ControlPointLifetimeEntry } from '../../ui/timeline/ControlPointLifetimeEntry';
import type { KeyframePiece } from './KeyframePiece';
import { Anchor, Axes, dependencyLoader, FillDirection, FillFlowContainer, Vec2 } from '@osucad/framework';
import { DiamondKeyframePiece } from './DiamondKeyframePiece';
import { TimingScreenSelectionBlueprint } from './TimingScreenSelectionBlueprint';

export abstract class KeyframeSelectionBlueprint<T extends ControlPoint> extends TimingScreenSelectionBlueprint<T> {
  protected constructor() {
    super();
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
      this.createKeyframePiece(),
      this.badgeContainer,
    );
  }

  protected createKeyframePiece(): KeyframePiece {
    return new DiamondKeyframePiece(this, {
      anchor: Anchor.CenterLeft,
      origin: Anchor.Center,
    });
  }
}
