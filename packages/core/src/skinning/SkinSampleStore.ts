import type { AudioChannel, AudioManager, IFileSystem, Sample } from "@osucad/framework";

export class SkinSampleStore
{
  private readonly _extensions = ["mp3", "wav"];

  constructor(
    readonly files: IFileSystem,
    readonly audioManager: AudioManager,
    readonly channel: AudioChannel,
  )
  {
  }

  get(name: string)
  {
    const buffer = this._audioBuffers.get(name);
    if (!buffer)
      return null;

    return this.audioManager.createSample(this.channel, buffer);
  }

  private readonly _audioBuffers = new Map<string, AudioBuffer>();

  private readonly _sampleP = new Map<string, Promise<AudioBuffer | null>>();

  async load(name: string): Promise<Sample | null>
  {
    let sampleP = this._sampleP.get(name);

    if (!sampleP)
    {
      sampleP = this._load(name);
      this._sampleP.set(name, sampleP);
    }

    const audioBuffer = await sampleP;

    if (!audioBuffer)
      return null;

    return this.audioManager.createSample(this.channel, audioBuffer);
  }


  async loadAll()
  {
    const files = this.files.entries()
      .filter(it =>
        this._extensions.some(extension => it.path.endsWith(`.${extension}`)),
      );

    await Promise.all(
        files.map(file => this.load(file.path)),
    );
  }

  private _getEntry(name: string)
  {
    if (this.files.get(name))
      return this.files.get(name);

    for (const extension of this._extensions)
    {
      const entry = this.files.get(`${name}.${extension}`);
      if (entry)
        return entry;
    }

    return null;
  }

  private async _load(name: string): Promise<AudioBuffer | null>
  {
    const entry = this._getEntry(name);
    if (!entry)
      return null;

    return entry.read()
      .then(data => this.audioManager.context.decodeAudioData(data))
      .catch(() =>
      {
        console.warn(`Failed to decode sample for "${entry.path}"`);
        return null;
      })
      .then(buffer =>
      {
        if (buffer)
          this._audioBuffers.set(name, buffer);

        return buffer;
      });
  }
}
