import type { Bindable } from 'osucad-framework';
import type { DifficultyAttributes } from '../../../difficulty/DifficultyAttributes';
import { Axes, CompositeDrawable, dependencyLoader, EasingFunction, resolved } from 'osucad-framework';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { EditorDifficultyManager } from '../../difficulty/EditorDifficultyManager';
import { ThemeColors } from '../../ThemeColors';

export class DifficultyInfo extends CompositeDrawable {
  @resolved(EditorDifficultyManager)
  difficultyManager!: EditorDifficultyManager;

  difficultyAttributes!: Bindable<DifficultyAttributes | null>;

  @resolved(ThemeColors)
  colors!: ThemeColors;

  #starRating = 0;

  get starRating() {
    return this.#starRating;
  }

  set starRating(value) {
    if (value === this.#starRating)
      return;

    this.#starRating = value;
    this.#text.text = `Star rating: ${value.toFixed(2)}`;
  }

  @dependencyLoader()
  load() {
    this.autoSizeAxes = Axes.Both;

    this.addInternal(this.#text = new OsucadSpriteText({
      text: 'Star rating: 0.00',
      fontSize: 12,
      color: this.colors.text,
    }));

    this.difficultyAttributes = this.difficultyManager.difficultyAttributes.getBoundCopy();

    this.difficultyAttributes.addOnChangeListener((e) => {
      if (e.value)
        this.transformTo('starRating', e.value.starRating, 350, EasingFunction.OutQuad);
    });
  }

  #text!: OsucadSpriteText;
}
