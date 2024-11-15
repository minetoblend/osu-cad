import type { DrawableHitObject, JudgementResult } from '@osucad/common';
import { AudioMixer, HitResult, ISkinSource, OsuPlayfield } from '@osucad/common';
import { Bindable, BindableNumber, Component, dependencyLoader, resolved } from 'osucad-framework';

export class GameplayProcessor extends Component {
  @resolved(OsuPlayfield)
  playfield!: OsuPlayfield;

  @resolved(ISkinSource)
  skin!: ISkinSource;

  @dependencyLoader()
  load() {
    this.playfield.newResult.addListener(this.#onNewResult, this);
  }

  currentCombo = new Bindable(0);

  #lastComboBreakTime = 0;

  @resolved(AudioMixer)
  mixer!: AudioMixer;

  breakCombo() {
    if (this.time.current - this.#lastComboBreakTime >= 1000) {
      const sample = this.skin.getSample(this.mixer.userInterface, 'combobreak');
      if (sample)
        sample.play();
    }

    this.currentCombo.value = 0;
    this.#lastComboBreakTime = this.time.current;
  }

  accuracy = new BindableNumber(0);

  totalScore = 0;

  maximumScore = 0;

  #onNewResult([hitObject, result]: [DrawableHitObject, JudgementResult]) {
    this.maximumScore += 300;

    switch (result.type) {
      case HitResult.Great:
        this.totalScore += 300;
        break;
      case HitResult.Ok:
        this.totalScore += 100;
        break;
      case HitResult.Meh:
        this.totalScore += 50;
        break;
      case HitResult.Miss:
        break;
    }

    this.accuracy.value = this.totalScore / this.maximumScore;

    if (result.type === HitResult.Miss) {
      this.breakCombo();
      return;
    }

    this.currentCombo.value++;
  }
}
