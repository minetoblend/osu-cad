import type { MouseDownEvent } from 'osucad-framework';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { Anchor, MouseButton } from 'osucad-framework';
import { TimelineHitObjectCircle } from './TimelineHitObjectCircle';

export class TimelineHitObjectTail extends TimelineHitObjectCircle {
  constructor(blueprint: TimelineHitObjectBlueprint) {
    super(blueprint);
    this.anchor = Anchor.CenterRight;
    this.origin = Anchor.CenterRight;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    return e.button === MouseButton.Left;
  }
}
