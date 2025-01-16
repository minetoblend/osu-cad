import type { OsuTimelineHitObjectBlueprint } from './OsuTimelineHitObjectBlueprint';
import { Anchor, MouseButton, type MouseDownEvent } from '@osucad/framework';
import { Slider } from '../../hitObjects/Slider';
import { TimelineHitObjectCircle } from './TimelineHitObjectCircle';

export class TimelineHitObjectTail extends TimelineHitObjectCircle {
  constructor(blueprint: OsuTimelineHitObjectBlueprint) {
    super(blueprint);
    this.anchor = Anchor.CenterRight;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (!this.selected.value)
      return false;

    if (e.button === MouseButton.Left && !e.controlPressed) {
      if (this.selection && this.blueprint.hitObject instanceof Slider) {
        this.selection.setSelectionType(this.blueprint.hitObject, this.blueprint.hitObject.spanCount);
        this.blueprint.preventSelection = true;
      }
    }

    return false;
  }
}
