import type { AudioChannel, AudioManager, IResourceStore, Sample } from '@osucad/framework';
import { ResourceStore } from '@osucad/framework';

export class SkinSampleStore {
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

  #buffers = new Map<string, AudioBuffer>();

  #extensions = ['.wav', '.ogg', '.mp3'];

  #stripExtension(name: string) {
    for (const extension of this.#extensions) {
      if (name.endsWith(extension)) {
        name = name.slice(0, -extension.length);
        break;
      }
    }

    return name;
  }

  async loadAvailable(
    filter?: (name: string) => boolean,
  ) {
    const names = this.#resources.getAvailableResources().filter(filename =>
      this.#extensions.some(ext => filename.endsWith(ext))
      && (!filter || filter(filename)),
    );

    await Promise.all(names.map(name => this.loadSample(name)));
  }

  async loadSample(name: string): Promise<AudioBuffer | null> {
    let data = this.#resources.get(name);
    if (!data)
      data = await this.#resources.getAsync(name);
    if (!data)
      return null;

    const cloned = new ArrayBuffer(data.byteLength);
    new Uint8Array(cloned).set(new Uint8Array(data));

    const sample = await this.#audioManager.context.decodeAudioData(cloned)
      .catch((e) => {
        console.warn(`Failed to load sample "${name}"`, e);
        return null;
      });

    if (sample) {
      this.#buffers.set(this.#stripExtension(name), sample);
    }

    return sample;
  }

  #samples = new Map<string, Sample>();

  getSample(channel: AudioChannel, name: string): Sample | null {
    let sample = this.#samples.get(name);

    if (!sample) {
      const buffer = this.#buffers.get(this.#stripExtension(name));

      if (buffer) {
        sample = this.#audioManager.createSample(channel, buffer);

        sample.name = name;

        this.#samples.set(name, sample);
      }
    }

    return sample ?? null;
  }
}
