import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { HitObjectSelectionManager } from '../../../editor/screens/compose/HitObjectSelectionManager';
import { Slider } from '../hitObjects/Slider';

export class OsuSelectionManager extends HitObjectSelectionManager<OsuHitObject> {
  constructor() {
    super();

    this.selectionChanged.addListener(({ hitObject, selected }) => {
      if (!selected && hitObject instanceof Slider)
        this.#sliderSelectionTypes.delete(hitObject);

      if (this.length > 1)
        this.scheduler.addOnce(this.#clearSliderSelection, this);
    });
  }

  readonly #sliderSelectionTypes = new Map<Slider, SliderSelectionType>();

  getSelectionType(slider: Slider): SliderSelectionType {
    return this.#sliderSelectionTypes.get(slider) ?? 'default';
  }

  setSelectionType(slider: Slider, type: SliderSelectionType) {
    this.select(slider);

    this.#sliderSelectionTypes.set(slider, type);
    this.selectionChanged.emit({ hitObject: slider, selected: true });
  }

  #clearSliderSelection() {
    const entries = [...this.#sliderSelectionTypes.entries()];
    this.#sliderSelectionTypes.clear();

    for (const [slider, value] of entries) {
      if (value !== 'default') {
        const selected = this.isSelected(slider);
        if (!selected)
          console.error('Slider had selection type while not selected, this should never happen.');

        this.selectionChanged.emit({
          hitObject: slider,
          selected,
        });
      }
    }
  }
}

export type SliderSelectionType =
  | 'default'
  | 'body'
  | 'head'
  | 'tail'
  | number;
