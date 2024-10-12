import type { DifficultyAttributes } from '../../difficulty/DifficultyAttributes.ts';
import { Bindable, Component, dependencyLoader, resolved } from 'osucad-framework';
import { Beatmap } from '../../beatmap/Beatmap.ts';
import { StableBeatmapEncoder } from '../../beatmap/StableBeatmapEncoder.ts';
import { CommandManager } from '../context/CommandManager.ts';
import Worker from './EditorDifficultyWorker?worker';

export class EditorDifficultyManager extends Component {
  worker!: Worker;

  @dependencyLoader()
  load() {
    this.worker = new Worker();

    this.worker.addEventListener('message', (evt) => {
      this.difficultyAttributes.value = evt.data.difficultyAttributes;
      this.strains.value = evt.data.strains;
    });

    this.scheduler.addDelayed(() => {
      this.recalculate();
    }, 2000, true);

    this.commandManager.commandApplied.addListener(this.#invalidated, this);
  }

  @resolved(CommandManager)
  commandManager!: CommandManager;

  #invalidated() {
    this.#shouldRecalculate = true;
  }

  protected loadComplete() {
    super.loadComplete();

    this.recalculate();
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  readonly difficultyAttributes = new Bindable<DifficultyAttributes | null>(null);

  readonly strains = new Bindable<number[][] | null>(null);

  #shouldRecalculate = true;

  recalculate() {
    if (!this.#shouldRecalculate)
      return;

    const serialized = new StableBeatmapEncoder().encode(this.beatmap);

    this.worker.postMessage(serialized);
  }

  override dispose(isDisposing: boolean = true) {
    this.worker.terminate();

    this.commandManager.commandApplied.removeListener(this.#invalidated, this);

    super.dispose(isDisposing);
  }
}
