import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { Anchor } from 'osucad-framework';
import { OsuSelectionManager } from '../../../../rulesets/osu/edit/OsuSelectionManager';
import { Slider } from '../../../../rulesets/osu/hitObjects/Slider';
import { type HitObjectSelectionEvent, HitObjectSelectionManager } from '../../../screens/compose/HitObjectSelectionManager';
import { TimelineHitObjectCircle } from './TimelineHitObjectCircle';

export class TimelineHitObjectTail extends TimelineHitObjectCircle {
  constructor(blueprint: TimelineHitObjectBlueprint) {
    super(blueprint);
    this.anchor = Anchor.CenterRight;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const selectionManager = dependencies.resolve(HitObjectSelectionManager);
    if (selectionManager instanceof OsuSelectionManager) {
      this.selection = selectionManager;
      selectionManager.selectionChanged.addListener(this.#selectionChanged, this);
    }
  }

  selection?: OsuSelectionManager;

  #selectionChanged(event: HitObjectSelectionEvent) {
    if (!this.blueprint.hitObject || event.hitObject !== this.blueprint.hitObject)
      return;

    this.updateSelection();
  }

  updateSelection() {
    // TODO: do this in a way that doesn't depend on specific rulesets
    if (this.blueprint.hitObject instanceof Slider && this.selection?.isSelected(this.blueprint.hitObject!)) {
      const slider = this.blueprint.hitObject as Slider;

      const type = this.selection?.getSelectionType(this.blueprint.hitObject!);

      const active
        = type === slider.spanCount
        || (slider.spanCount % 2 === 0 && type === 'head')
        || (slider.spanCount % 2 === 1 && type === 'tail');

      this.selectionOverlay.color = active ? 0xFF0000 : 0xFFFFFF;
    }
  }
}
