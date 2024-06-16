import { AudioManager } from '@/framework/audio/AudioManager.ts';

export class UISamples {
  toolSwitch!: AudioBuffer;
  click!: AudioBuffer;

  constructor(readonly audioManager: AudioManager) {}

  get context() {
    return this.audioManager.context;
  }

  async load() {
    await Promise.all([
      this.loadSound('toolSwitch', '/assets/sounds/click1.ogg'),
      this.loadSound('click', '/assets/sounds/click4.ogg'),
    ]);
  }

  async loadSound(name: keyof UISamples, url: string) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    (this as any)[name] = await this.context.decodeAudioData(buffer);
  }
}
