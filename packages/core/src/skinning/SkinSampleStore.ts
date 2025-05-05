import type { AudioChannel, AudioManager, IFileSystem, Sample } from "@osucad/framework";
import { Mp3Decoder } from "./Mp3Decoder";

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
    const entry = this._getEntry(name);
    if (!entry)
      return null;

    const buffer = this._audioBuffers.get(entry.path);
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
      if (entry.path.endsWith(".mp3") || entry.path.endsWith(".wav"))
      {
        const buffer = await decodeFallback(data);

        if (buffer)
          return buffer;

      }

      console.warn(`Failed to decode sample for "${entry.path}"`);

      return null;
    }
  }
}

let decoder: Mp3Decoder | undefined;

async function decodeFallback(data: ArrayBuffer): Promise<AudioBuffer | null>
{
  try
  {
    decoder ??= new Mp3Decoder();

    const audioData = await decoder.decode(data);

    if (audioData.errors.length || audioData.channelData.length === 0)
      return null;

    const audioBuffer = new AudioBuffer({
      numberOfChannels: audioData.channelData.length,
      sampleRate: Math.max(audioData.sampleRate, 76800),
      length: Math.max(audioData.samplesDecoded, 1),
    });

    if (audioData.samplesDecoded === 0)
      return audioBuffer;

    for (let i = 0; i < audioData.channelData.length; i++)
    {
      audioBuffer.copyToChannel(audioData.channelData[i], i);
    }

    return audioBuffer;
  }
  catch (e)
  {
    console.error(e);
    return null;
  }
}
