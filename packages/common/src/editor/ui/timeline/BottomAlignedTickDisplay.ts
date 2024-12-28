import type { Vec2 } from 'osucad-framework';
import type { PointVisualization } from './PointVisualization';
import { Anchor } from 'osucad-framework';
import { TimelineTickDisplay } from './TimelineTickDisplay';

export class BottomAlignedTickDisplay extends TimelineTickDisplay {
  protected override createPointVisualization(): PointVisualization {
    return super.createPointVisualization().with({
      anchor: Anchor.BottomLeft,
      origin: Anchor.BottomCenter,
    });
  }

  protected override getSize(divisor: number, indexInBar: number): Vec2 {
    return super.getSize(divisor, indexInBar).mul({
      x: 0.5,
      y: 1,
    });
  }
}
