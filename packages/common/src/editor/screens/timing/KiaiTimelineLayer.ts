import type { ColorSource } from 'pixi.js';
import { dependencyLoader } from 'osucad-framework';
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
    this.add(new KiaiBlueprintContainer());
  }
}
