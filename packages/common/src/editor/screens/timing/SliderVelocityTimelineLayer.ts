import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, Box, dependencyLoader } from 'osucad-framework';
import { SliderVelocityBlueprintContainer } from './SliderVelocityBlueprintContainer';
import { TimingScreenTimelineLayer } from './TimingScreenTimelineLayer';

export class SliderVelocityTimelineLayer extends TimingScreenTimelineLayer {
  constructor() {
    super('Slider Velocity');
  }

  override get layerColor(): ColorSource {
    return 0xFFBE40;
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.add(new Box({
      relativeSizeAxes: Axes.X,
      height: 24,
      alpha: 0.02,
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
    }));
    this.add(new SliderVelocityBlueprintContainer());
  }
}
