import { AudioChannel, AudioManager, Container } from 'osucad-framework';

export class EditorMixer extends Container {
  constructor(readonly audioManager: AudioManager) {
    super();
    this.music = audioManager.createChannel();
    this.hitsounds = audioManager.createChannel();
    this.userInterface = audioManager.createChannel();
  }

  readonly music: AudioChannel;

  readonly hitsounds: AudioChannel;

  readonly userInterface: AudioChannel;

  editorMixer() {}
}
