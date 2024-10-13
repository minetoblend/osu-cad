import type { Bindable, SpriteText } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import { OsucadSpriteText } from '../OsucadSpriteText.ts';
import { GameplayProcessor } from './GameplayProcessor.ts';

export class ComboOverlay extends CompositeDrawable {
  @resolved(GameplayProcessor)
  gameplayProcessor!: GameplayProcessor;

  currentCombo!: Bindable<number>;

  @dependencyLoader()
  load() {
    this.anchor = Anchor.BottomLeft;
    this.origin = Anchor.BottomLeft;
    this.x = 10;
    this.y = -10;

    this.autoSizeAxes = Axes.Both;

    this.addInternal(this.#comboText = new OsucadSpriteText({
      text: '0',
      fontSize: 36,
    }));

    this.currentCombo = this.gameplayProcessor.currentCombo.getBoundCopy();
  }

  #comboText!: SpriteText;

  protected loadComplete() {
    super.loadComplete();

    this.currentCombo.addOnChangeListener((e) => {
      this.#comboText.text = Math.round(e.value).toString();
    });
  }
}
