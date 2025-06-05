import type { ReadonlyDependencyContainer, ScheduledDelegate } from "@osucad/framework";
import { Action, PoolableDrawable } from "@osucad/framework";
import { ISkinSource } from "./ISkinSource";

export class SkinReloadableDrawable extends PoolableDrawable
{
  #pendingSkinChange?: ScheduledDelegate;

  public readonly onSkinChanged = new Action();

  #currentSkin!: ISkinSource;

  protected get currentSkin()
  {
    return this.#currentSkin;
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.#currentSkin = dependencies.resolve(ISkinSource);
    this.#currentSkin.sourceChanged.addListener(this.#onChange, this);
  }

  protected override loadAsyncComplete()
  {
    super.loadAsyncComplete();
    this.#skinChanged();
  }

  flushPendingSkinChanges()
  {
    if (!this.#pendingSkinChange)
      return;

    this.#pendingSkinChange.runTask();
    this.#pendingSkinChange = undefined;
  }

  protected skinChanged(skin: ISkinSource)
  {
  }

  #onChange()
  {
    this.#pendingSkinChange?.cancel();
    this.#pendingSkinChange = this.scheduler.add(this.#skinChanged, this)!;
  }

  #skinChanged()
  {
    this.skinChanged(this.currentSkin);
    this.onSkinChanged.emit();

    this.#pendingSkinChange = undefined;
  }

  override dispose(isDisposing: boolean = true)
  {
    super.dispose(isDisposing);

    this.currentSkin.sourceChanged.removeListener(this.#onChange, this);

    this.onSkinChanged.removeAllListeners();
  }
}
