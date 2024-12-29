import type { Bindable, SpriteText } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, dependencyLoader, EasingFunction, resolved } from 'osucad-framework';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { GameplayProcessor } from './GameplayProcessor';

export class AccuracyOverlay extends CompositeDrawable {
  @resolved(GameplayProcessor)
  gameplayProcessor!: GameplayProcessor;

  accuracy!: Bindable<number>;

  @dependencyLoader()
  load() {
    this.anchor = Anchor.TopRight;
    this.origin = Anchor.TopRight;
    this.x = -10;
    this.y = 10;

    this.autoSizeAxes = Axes.Both;

    this.addInternal(this.#comboText = new OsucadSpriteText({
      text: '0',
      fontSize: 22,
    }));

    this.accuracy = this.gameplayProcessor.accuracy.getBoundCopy();
  }

  #comboText!: SpriteText;

  #accuracyValue = 0;

  get accuracyValue() {
    return this.#accuracyValue;
  }

  set accuracyValue(value) {
    this.#accuracyValue = value;

    this.#comboText.text = `${(value * 100).toFixed(2)}%`;
  }

  protected loadComplete() {
    super.loadComplete();

    this.accuracy.addOnChangeListener(e => this.transformTo('accuracyValue', e.value, 200, EasingFunction.OutCubic));
  }
}
