import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, Box, dependencyLoader } from '@osucad/framework';
import { BottomAlignedTickDisplay } from '../../ui/timeline/BottomAlignedTickDisplay';
import { TimelineLayer, TimelineLayerHeader } from '../../ui/timeline/TimelineLayer';

export class TopTimelineLayer extends TimelineLayer {
  constructor() {
    super('');
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.height = 12;
    this.addAll(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
      }),
      new BottomAlignedTickDisplay().with({
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
      }),
    );
  }

  override get layerColor(): ColorSource {
    return 0xFF0000;
  }

  protected override createHeader(): TimelineLayerHeader {
    return new TopTimelineLayerHeader();
  }
}

class TopTimelineLayerHeader extends TimelineLayerHeader {
  constructor() {
    super('', 0xFF0000);
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.padding = { vertical: -1, left: -1 };
    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
      }),
    );
  }
}
