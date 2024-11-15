import type { DependencyContainer, ScheduledDelegate } from 'osucad-framework';
import { Action, dependencyLoader, PoolableDrawable } from 'osucad-framework';
import { ISkinSource } from './ISkinSource';

export class SkinReloadableDrawable extends PoolableDrawable {
  #pendingSkinChange: ScheduledDelegate | null = null;

  currentSkin: ISkinSource | null = null;

  onSkinChanged = new Action();

  @dependencyLoader()
  [Symbol('load')](dependencies: DependencyContainer) {
    this.currentSkin = dependencies.resolve(ISkinSource);
    this.currentSkin.sourceChanged.addListener(this.#onChange, this);
  }

  protected override loadAsyncComplete() {
    super.loadAsyncComplete();

    this.#skinChanged();
  }

  protected flushPendingSkinChanges() {
    if (!this.#pendingSkinChange)
      return;

    this.#pendingSkinChange.runTask();
    this.#pendingSkinChange = null;
  }

  protected skinChanged(skin: ISkinSource) {
  }

  #onChange() {
    this.#pendingSkinChange?.cancel();
    // this.#pendingSkinChange = this.scheduler.add(this.#skinChanged, this);
    this.#skinChanged();
  }

  #skinChanged() {
    this.skinChanged(this.currentSkin!);
    this.onSkinChanged.emit();

    this.#pendingSkinChange = null;
  }

  override dispose(disposing: boolean = true) {
    super.dispose(disposing);

    if (this.currentSkin)
      this.currentSkin.sourceChanged.removeListener(this.#onChange, this);

    this.onSkinChanged.removeAllListeners();
  }
}
