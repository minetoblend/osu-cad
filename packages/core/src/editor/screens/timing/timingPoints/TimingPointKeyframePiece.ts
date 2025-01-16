import type { HoverEvent, HoverLostEvent } from '@osucad/framework';
import { Anchor, Axes, ColorUtils, dependencyLoader } from '@osucad/framework';
import { KeyframePiece } from '../KeyframePiece';
import { TimingPointKeyframeShape } from './TimingPointKeyframeShape';

export class TimingPointKeyframePiece extends KeyframePiece {
  #shape!: TimingPointKeyframeShape;

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.Y;
    this.width = 10;
    this.origin = Anchor.TopCenter;

    this.addInternal(
      this.#shape = new TimingPointKeyframeShape(),
    );
  }

  protected override updateColors() {
    if (this.selected.value) {
      this.#shape.color = ColorUtils.lighten(this.keyframeColor.value, 0.5);
    }
    else if (this.isHovered) {
      this.#shape.color = ColorUtils.lighten(this.keyframeColor.value, 0.25);
    }
    else {
      this.#shape.color = this.keyframeColor.value;
    }
  }

  override onHover(e: HoverEvent): boolean {
    this.updateColors();
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.updateColors();
  }
}
