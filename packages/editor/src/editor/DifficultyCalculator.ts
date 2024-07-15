import {
  Bindable,
  Container,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Beatmap } from '@osucad/common';
import Worker from './DifficultyCalculatorWorker?worker&inline';

export class DifficultyCalculator extends Container {
  worker = new Worker();

  starRating = new Bindable<number>(0);

  @dependencyLoader()
  load() {
    this.worker.onmessage = (event) => {
      const { starRating } = event.data;
      this.#isCalculating = false;

      this.starRating.value = starRating;
    };

    this.scheduler.addDelayed(
      () => {
        this.#calculate();
      },
      5000,
      true,
    );
    this.#calculate();
  }

  #isCalculating = false;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  #calculate() {
    if (this.#isCalculating)
      return;

    this.#isCalculating = true;
    this.worker.postMessage(this.beatmap.serialize());
  }
}
