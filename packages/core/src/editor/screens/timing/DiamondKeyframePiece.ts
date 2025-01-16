import type { HoverEvent, HoverLostEvent } from '@osucad/framework';
import { Anchor, Axes, ColorUtils, dependencyLoader, EasingFunction } from '@osucad/framework';
import { DiamondShape } from './DiamondShape';
import { KeyframePiece } from './KeyframePiece';

export class DiamondKeyframePiece extends KeyframePiece {
  diamond!: DiamondShape;

  @dependencyLoader()
  [Symbol('load')]() {
    this.padding = 4;
    this.width = 20;
    this.height = 20;

    this.addAllInternal(this.diamond = new DiamondShape({
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));
  }

  protected override updateColors() {
    if (this.selected.value) {
      this.diamond.body.color = ColorUtils.lighten(this.keyframeColor.value, 0.5);
      this.diamond.outline.color = ColorUtils.lighten(this.keyframeColor.value, 1);
      this.diamond.outline.alpha = 1;
    }
    else {
      this.diamond.body.color = this.keyframeColor.value;
      this.diamond.outline.color = this.keyframeColor.value;
      this.diamond.outline.alpha = 0.5;
    }
  }

  override onHover(e: HoverEvent): boolean {
    this.diamond.scaleTo(1.2, 200, EasingFunction.OutExpo);
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.diamond.scaleTo(1, 200, EasingFunction.OutExpo);
  }
}
