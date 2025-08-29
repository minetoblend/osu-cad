import type { IResourceStore } from "../io/stores/IResourceStore";
import { ResourceStore } from "../io/stores/ResourceStore";
import type { IAudioDestination } from "./IAudioDestination";
import type { ISampleStore } from "./ISampleStore";
import { Sample } from "./Sample";

export class SampleStore implements ISampleStore
{
  readonly #store: ResourceStore<ArrayBuffer>;

  readonly #destination: IAudioDestination;

  readonly #buffers = new Map<string, AudioBuffer>();

  public constructor(
    public readonly context: AudioContext,
    store: IResourceStore<ArrayBuffer>,
    destination: IAudioDestination,
  )
  {
    this.#store = new ResourceStore(store);
    this.#destination = destination;

    this.addExtension("wav");
    this.addExtension("mp3");
  }

  public addExtension(extension: string)
  {
    this.#store.addExtension(extension);
  }

  public canLoad(name: string)
  {
    return this.#store.canLoad(name);
  }

  public async load(name: string)
  {
    if (this.#buffers.has(name))
      return;

    const data = await this.#store.getAsync(name);
    if (data === null)
      return;

    const audioBuffer = await this.context.decodeAudioData(data);
    this.#buffers.set(name, audioBuffer);
  }

  public get(name: string): Sample | null
  {
    const buffer = this.#buffers.get(name);
    if (!buffer)
      return null;

    const sample = new Sample(name, buffer, this.context);
    this.#destination.connect(sample);

    return sample;
  }

  public async getAsync(name: string)
  {
    return this.get(name);
  }

  public has(name: string)
  {
    return this.#store.has(name);
  }

  public getAvailableResources()
  {
    return this.#store.getAvailableResources();
  }

  public dispose(): void
  {
  }
}
