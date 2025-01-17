import type { DependencyContainer, ReadonlyDependencyContainer } from '@osucad/framework';
import type { UserClockInfo } from '@osucad/multiplayer';
import type { MultiplayerEditorBeatmap } from './MultiplayerEditorBeatmap';
import { Editor } from '../Editor';
import { MultiplayerClient } from './MultiplayerClient';

export class MultiplayerEditor extends Editor {
  constructor(editorBeatmap: MultiplayerEditorBeatmap) {
    super(editorBeatmap);
  }

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  override editorBeatmap!: MultiplayerEditorBeatmap;

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    this.addInternal(this.editorBeatmap.client);

    this.#dependencies.provide(MultiplayerClient, this.editorBeatmap.client);

    return await super.loadAsync(dependencies);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.scheduler.addDelayed(() => this.updateClockPresence(), 100, true);
  }

  #lastClockPresence?: UserClockInfo;

  updateClockPresence() {
    const { currentTime, isRunning, rate } = this.editorClock;

    if (!this.#lastClockPresence || currentTime !== this.#lastClockPresence.currentTime || isRunning !== this.#lastClockPresence.isRunning || rate !== this.#lastClockPresence.rate) {
      this.editorBeatmap.client.users.updatePresence('clock', this.#lastClockPresence = {
        currentTime: this.editorClock.currentTime,
        isRunning: this.editorClock.isRunning,
        rate: this.editorClock.rate,
      });
    }
  }
}
