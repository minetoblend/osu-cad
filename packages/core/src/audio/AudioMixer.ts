import type { AudioManager } from "@osucad/framework";
import { AudioChannel } from "@osucad/framework";

export class AudioMixer
{
  constructor(audioManager: AudioManager)
  {
    this.music = new AudioChannel(audioManager);
    this.hitSounds = new AudioChannel(audioManager);
  }

  readonly music: AudioChannel;
  readonly hitSounds: AudioChannel;
}
