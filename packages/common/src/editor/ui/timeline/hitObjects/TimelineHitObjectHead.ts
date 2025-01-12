import type { MouseDownEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { MouseButton } from 'osucad-framework';
import { Slider } from '../../../../rulesets/osu/hitObjects/Slider';
import { DrawableComboNumber } from '../../../../rulesets/osu/skinning/stable/DrawableComboNumber';
import { TimelineHitObjectCircle } from './TimelineHitObjectCircle';

export class TimelineHitObjectHead extends TimelineHitObjectCircle {
  constructor(blueprint: TimelineHitObjectBlueprint) {
    super(blueprint);
  }

  #comboNumber!: DrawableComboNumber;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
    this.addAllInternal(
      this.#comboNumber = new DrawableComboNumber(),
    );

    this.blueprint.indexInComboBindable.addOnChangeListener(() => this.#updateComboNumber(), { immediate: true });
  }

  #updateComboNumber() {
    this.#comboNumber.comboNumber = this.blueprint.indexInComboBindable.value + 1;
  }

  override update() {
    super.update();

    this.#comboNumber.scale = (this.drawHeight / 140);
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
