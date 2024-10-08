import type { DifficultyAttributes } from '../../difficulty/DifficultyAttributes.ts';
import { Bindable, Component, dependencyLoader, resolved } from 'osucad-framework';
import { Beatmap } from '../../beatmap/Beatmap.ts';
import { serializeBeatmap } from '../../beatmap/serialization/Beatmap.ts';
import Worker from './EditorDifficultyWorker?worker';

export class EditorDifficultyManager extends Component {
  worker!: Worker;

  @dependencyLoader()
  load() {
    this.worker = new Worker();

    this.worker.addEventListener('message', (evt) => {
      this.difficultyAttributes.value = evt.data.difficultyAttributes;
    });

    this.scheduler.addDelayed(() => {
      this.recalc();
    }, 2000, true);
  }

  protected loadComplete() {
    super.loadComplete();

    this.recalc();
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  difficultyAttributes = new Bindable<DifficultyAttributes | null>(null);

  recalc() {
    const serialized = serializeBeatmap(this.beatmap);

    this.worker.postMessage(serialized);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.worker.terminate();
  }
}
