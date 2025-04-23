import type { Bindable, MouseDownEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { OsuTimelineHitObjectBlueprint } from './OsuTimelineHitObjectBlueprint';
import { IComboNumberReference, SkinnableDrawable } from '@osucad/core';
import { Anchor, MouseButton, provide } from '@osucad/framework';
import { DrawableComboNumber, OsuSkinComponentLookup } from '@osucad/ruleset-osu';
import { Slider } from '../../hitObjects/Slider';
import { TimelineHitObjectCircle } from './TimelineHitObjectCircle';

@provide(IComboNumberReference)
export class TimelineHitObjectHead extends TimelineHitObjectCircle implements IComboNumberReference {
  constructor(blueprint: OsuTimelineHitObjectBlueprint) {
    super(blueprint);
  }

  #comboNumber!: SkinnableDrawable;

  indexInComboBindable!: Bindable<number>;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
    this.indexInComboBindable = this.blueprint.indexInComboBindable.getBoundCopy();

    this.addAllInternal(
      this.#comboNumber = new SkinnableDrawable(OsuSkinComponentLookup.ComboNumber, () => new DrawableComboNumber()).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );
  }

  override update() {
    super.update();

    this.#comboNumber.scale = (this.drawHeight / 100);
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (!this.selected.value)
      return false;

    if (e.button === MouseButton.Left && !e.controlPressed) {
      if (this.selection && this.blueprint.hitObject instanceof Slider) {
        this.selection.setSelectionType(this.blueprint.hitObject, 0);
        this.blueprint.preventSelection = true;
      }
    }

    return false;
  }
}
