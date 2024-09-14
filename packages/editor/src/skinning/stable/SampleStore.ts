import { IResourceStore } from '../IResourceStore.ts';
import { AudioChannel, AudioManager, ResourceStore, Sample } from 'osucad-framework';

export class SampleStore {
  #audioManager: AudioManager;

  #resources = new ResourceStore<ArrayBuffer>();

  constructor(
    audioManager: AudioManager,
    resources: IResourceStore<ArrayBuffer>,
  ) {
    this.#audioManager = audioManager;
    this.#resources.addStore(resources);

    this.#resources.addExtension('wav');
    this.#resources.addExtension('ogg');
    this.#resources.addExtension('mp3');
  }

  async getSample(channel: AudioChannel, name: string): Promise<Sample | null> {
    const data = this.#resources.get(name);
    if (!data) {
      return null;
    }

    console.log(name, data)

    return this.#audioManager.createSampleFromArrayBuffer(channel, data).catch((e) => {
      console.warn(`Failed to load sample "${name}"`, e);

      return null;
    });
  }

}
