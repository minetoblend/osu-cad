import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, Box, dependencyLoader } from 'osucad-framework';
import { KiaiBlueprintContainer } from './KiaiBlueprintContainer';
import { TimingScreenTimelineLayer } from './TimingScreenTimelineLayer';

export class KiaiTimelineLayer extends TimingScreenTimelineLayer {
  constructor() {
    super('Kiai');
  }

  override get layerColor(): ColorSource {
    return 0x6AF878;
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
    this.add(new KiaiBlueprintContainer());
  }
}
