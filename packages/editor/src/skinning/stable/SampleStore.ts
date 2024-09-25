import type { AudioChannel, AudioManager, Sample } from 'osucad-framework';
import type { IResourceStore } from '../IResourceStore';
import { ResourceStore } from 'osucad-framework';

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

    return this.#audioManager.createSampleFromArrayBuffer(channel, data).catch((e) => {
      console.warn(`Failed to load sample "${name}"`, e);

      return null;
    });
  }
}
