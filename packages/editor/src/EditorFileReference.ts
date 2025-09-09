import type { ValueChangedEvent } from "@osucad/framework";
import { Bindable } from "@osucad/framework";
import type { RemoteFile, RemoteFileSystem } from "./runtime/dds/RemoteFileSystem";

export class EditorFileReference<T> extends Bindable<T | undefined>
{
  private readonly filename: Bindable<string>;
  private readonly file = new Bindable<RemoteFile | undefined>(undefined);

  public constructor(
    private readonly fileSystem: RemoteFileSystem,
    filename: Bindable<string>,
    private loadFn: (data: ArrayBuffer, abortSignal: AbortSignal) => Promise<T>,
  )
  {
    super(undefined);

    this.filename = filename.getBoundCopy();

    this.file.bindValueChanged(e =>
    {
      e.previousValue?.off("changed", this.loadData, this);
      e.previousValue?.off("removed", this.updateFile, this);

      e.value?.on("changed", this.loadData, this);
      e.value?.on("removed", this.updateFile, this);

      void this.loadData();
    });

    filename.bindValueChanged(this.updateFile, this, true);
  }

  private pending?: { cancel: () => void };

  private updateFile()
  {
    this.file.value = this.fileSystem.get(this.filename.value);
  }

  private async loadData()
  {
    this.pending?.cancel();

    if (!this.file.value)
    {
      this.value = undefined;
      return;
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    this.pending = {
      cancel: () =>
      {
        abortController.abort();
        this.pending = undefined;
      },
    };

    try
    {
      const data = await this.file.value.read();
      if (signal.aborted)
        return;

      const result = await this.loadFn(data, signal);
      if (signal.aborted)
        return;

      this.value = result;
      this.pending = undefined;
    }
    catch (e)
    {
      console.error(e);
    }
  }

  public override unbindAll()
  {
    this.filename.unbindAll();
    this.file.unbindAll();
    this.pending?.cancel();

    super.unbindAll();
  }
}
