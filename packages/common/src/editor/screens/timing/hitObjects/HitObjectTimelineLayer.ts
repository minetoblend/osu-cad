import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, Container, dependencyLoader } from 'osucad-framework';
import { TimelineHitObjectBlueprintContainer } from '../../../ui/timeline/hitObjects/TimelineHitObjectBlueprintContainer';
import { TimingScreenTimelineLayer } from '../TimingScreenTimelineLayer';

export class HitObjectTimelineLayer extends TimingScreenTimelineLayer {
  constructor() {
    super('HitObjects');
  }

  override get layerColor(): ColorSource {
    return 0x666666;
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.add(new Container({
      relativeSizeAxes: Axes.Both,
      height: 0.5,
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
      child: new TimelineHitObjectBlueprintContainer(),
    }));
  }
}
