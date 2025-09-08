import type { ValueChangedEvent } from "@osucad/framework";
import { Anchor, Axes, DrawableSprite, FillMode } from "@osucad/framework";
import { Bindable, CompositeDrawable, dependencyLoader, loadTexture, resolved } from "@osucad/framework";
import { EditorBeatmap } from "./runtime";
import type { BlobHandle } from "@osucad/multiplayer-core";
import type { RemoteFile } from "./runtime/dds/RemoteFileSystem";

export class EditorBackground extends CompositeDrawable
{
  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap

  private readonly filename = new Bindable<string>("");
  private readonly file = new Bindable<RemoteFile | undefined>(undefined);
  private readonly blob = new Bindable<BlobHandle | undefined>(undefined);

  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.Both;
    this.alpha = 0.25;

    this.filename.bindTo(this.#beatmap.beatmapInfo.backgroundFileBindable);
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.filename.bindValueChanged(this.#filenameChanged, this, true);
    this.file.bindValueChanged(this.#fileChanged, this, true);
    this.blob.bindValueChanged(this.#blobChanged, this, true);
  }

  #currentBackground?: DrawableSprite;

  #filenameChanged(e: ValueChangedEvent<string>)
  {
    this.file.value = this.#beatmap.fileSystem.get(e.value);
  }

  #fileChanged(e: ValueChangedEvent<RemoteFile | undefined>)
  {
    if (e.previousValue)
      e.previousValue.removeListener("changed", this.#fileUpdated, this);

    if (e.value)
      e.value.addListener("changed", this.#fileUpdated, this);

    this.blob.value = e.value?.blobHandle;
  }

  #fileUpdated(file: RemoteFile, blob: BlobHandle)
  {
    this.blob.value = blob;
  }

  async #blobChanged(e: ValueChangedEvent<BlobHandle | undefined>)
  {
    const background = e.value ? await this.#loadBackground(e.value) : undefined;

    this.#currentBackground?.fadeOut(200).expire();

    this.addInternal(this.#currentBackground = new DrawableSprite({
      texture: background,
      relativeSizeAxes: Axes.Both,
      fillMode: FillMode.Fill,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    this.#currentBackground.fadeInFromZero(200);
  }

  async #loadBackground(handle: BlobHandle)
  {

    const data = await handle.get();

    const copy = new ArrayBuffer(data.byteLength);
    new Uint8Array(copy).set(new Uint8Array(data));

    return await loadTexture(copy);
  }

  public override dispose(): void
  {
    this.file.value?.removeListener("changed", this.#fileUpdated, this);

    super.dispose();
  }
}
