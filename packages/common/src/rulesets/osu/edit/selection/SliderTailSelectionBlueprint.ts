import type { MouseDownEvent } from 'osucad-framework';
import type { OsuSelectionManager } from '../OsuSelectionManager';
import type { SliderSelectionBlueprint } from './SliderSelectionBlueprint';
import { Anchor, Axes, CompositeDrawable, MouseButton, resolved } from 'osucad-framework';
import { HitObjectSelectionManager } from '../../../../editor/screens/compose/HitObjectSelectionManager';
import { SkinnableDrawable } from '../../../../skinning/SkinnableDrawable';
import { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { OsuSkinComponentLookup } from '../../skinning/stable/OsuSkinComponentLookup';

export class SliderTailSelectionBlueprint extends CompositeDrawable {
  constructor(readonly blueprint: SliderSelectionBlueprint) {
    super();

    this.size = OsuHitObject.object_dimensions;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.addInternal(
      new SkinnableDrawable(OsuSkinComponentLookup.HitCircleSelect).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );
  }

  @resolved(HitObjectSelectionManager)
  selection!: OsuSelectionManager;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button !== MouseButton.Left)
      return false;

    if (!this.blueprint.selected.value)
      return false;

    if (e.controlPressed)
      return false;

    this.selection.setSelectionType(this.blueprint.hitObject!, 'tail');

    return true;
  }
}
