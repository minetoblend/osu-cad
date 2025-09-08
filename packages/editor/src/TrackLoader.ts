import type { AudioManager, Track } from "@osucad/framework";
import { Bindable } from "@osucad/framework";
import type { EditorBeatmap } from "./runtime";

export class TrackLoader
{
  public constructor(
    private readonly editorBeatmap: EditorBeatmap,
    private readonly audioManager: AudioManager,
  )
  {
  }

  public readonly track = new Bindable<Track | null>(null);

  #updateId = 0;

  public async load()
  {
    await this.#loadTrack();
  }

  async #loadTrack()
  {
    const id = ++this.#updateId;

    const filename = this.editorBeatmap.beatmapInfo.audioFile;

    const file = this.editorBeatmap.fileSystem.get(filename);

    if (!file)
    {
      this.track.value = null;
      return;
    }

    const data = await file.read();

    const buffer = new ArrayBuffer(data.byteLength);
    new Uint8Array(buffer).set(new Uint8Array(data));

    const audioBuffer = await this.audioManager.context.decodeAudioData(buffer);

    if (this.#updateId !== id)
      return;

    this.track.value = this.audioManager.createTrack(audioBuffer);
  }
}
