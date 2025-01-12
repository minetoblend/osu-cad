import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { Anchor } from 'osucad-framework';
import { TimelineHitObjectCircle } from './TimelineHitObjectCircle';

export class TimelineHitObjectTail extends TimelineHitObjectCircle {
  constructor(blueprint: TimelineHitObjectBlueprint) {
    super(blueprint);
    this.anchor = Anchor.CenterRight;
  }
}
