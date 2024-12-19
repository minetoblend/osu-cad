import { Anchor, Axes, Box, dependencyLoader } from 'osucad-framework';
import { TimingScreenTimelineLayer } from '../TimingScreenTimelineLayer';
import { VolumePointBlueprintContainer } from './VolumePointBlueprintContainer';
import { VolumePointPlacementBlueprint } from './VolumePointPlacementBlueprint';

export class VolumePointLayer extends TimingScreenTimelineLayer {
  constructor() {
    super('Volume');
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.height = 100;
    this.padding = { vertical: 4 };

    this.addAll(
      new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0.02,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
      new VolumePointBlueprintContainer(),
      new VolumePointPlacementBlueprint(),
    );
  }

  override get layerColor(): number {
    return 0x4763ED;
  }
}
