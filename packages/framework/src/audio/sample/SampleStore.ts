import type { IResourceStore } from '../../io/stores/IResourceStore';
import type { AudioChannel } from '../AudioChannel';
import type { ISampleStore } from './ISampleStore';
import type { Sample } from './Sample';
import { ResourceStore } from '../../io/stores/ResourceStore';
import { SampleFactory } from './SampleFactory';

export class SampleStore implements ISampleStore {
  readonly #store: ResourceStore<ArrayBuffer>;

  readonly #channel: AudioChannel;

  readonly #factories = new Map<string, SampleFactory | null>();

  constructor(store: IResourceStore<ArrayBuffer>, channel: AudioChannel) {
    this.#store = new ResourceStore(store);
    this.#channel = channel;

    this.addExtension('wav');
    this.addExtension('mp3');
  }

  addExtension(extension: string) {
    this.#store.addExtension(extension);
  }

  async load(name: string) {
    if (this.#factories.has(name))
      return;

    const data = await this.#store.getAsync(name);
    if (data === null)
      return;

    const audioBuffer = await this.#channel.manager.context.decodeAudioData(data);
    this.#factories.set(name, new SampleFactory(audioBuffer, name, this.#channel));
  }

  get(name: string): Sample | null {
    const factory = this.#factories.get(name);

    return factory?.createSample() ?? null;
  }

  async getAsync(name: string) {
    return this.get(name);
  }

  has(name: string) {
    return this.#store.has(name);
  }

  getAvailableResources() {
    return this.#store.getAvailableResources();
  }

  dispose(): void {}
}
