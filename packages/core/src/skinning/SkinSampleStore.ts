import type { AudioManager, IFileSystem, Sample } from "@osucad/framework";

export class SkinSampleStore
{
  private readonly _extensions = ["mp3", "wav", "ogg"];

  constructor(
    readonly files: IFileSystem,
    readonly audioManager: AudioManager,
  )
  {
  }

  get(name: string)
  {
    const entry = this._getEntry(name);
    if (!entry)
      return null;

    const buffer = this._audioBuffers.get(entry.path);
    if (!buffer)
      return null;

    const sample = this.audioManager.createSample(buffer, this.audioManager.sampleMixer, name);

    return sample;
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

    return this.audioManager.createSample(audioBuffer);
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

    const data = await entry.read();
    try
    {
      const dest = new ArrayBuffer(data.byteLength);
      new Uint8Array(dest).set(new Uint8Array(data));

      const buffer = await this.audioManager.context.decodeAudioData(dest);

      this._audioBuffers.set(entry.path, buffer);

      return buffer;
    }
    catch
    {
      console.warn(`Failed to decode sample for "${entry.path}"`);

      return null;
    }
  }
}
