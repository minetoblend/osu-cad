import { AudioMixer } from '@osucad/core';
import { AudioManager, Bindable, Component, resolved } from '@osucad/framework';

export class HomeScreenSongPlayback extends Component {
  readonly audioUrl = new Bindable<string | null>(null);

  audioEl = document.createElement('audio');

  constructor() {
    super();

    this.audioEl.onerror = () => {
      // playback is expected to fail here and there and would just be spamming sentry otherwise
    };
  }

  #paused = false;

  #source!: MediaElementAudioSourceNode;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(AudioMixer)
  mixer!: AudioMixer;

  protected loadComplete() {
    super.loadComplete();

    this.audioUrl.bindValueChanged(() => this.scheduler.addDebounced(this.#updateUrl, this, 250));
    this.#updateUrl();

    this.#source = this.audioManager.context.createMediaElementSource(this.audioEl);
    this.#source.connect(this.mixer.music.input);
  }

  #updateUrl() {
    if (this.audioUrl.value) {
      this.audioEl.src = this.audioUrl.value;
      this.audioEl.autoplay = !this.#paused;
    }
    else {
      this.audioEl.pause();
      this.audioEl.src = '';
    }
  }

  resume() {
    this.#paused = false;
    this.audioEl.autoplay = true;
    try {
      this.audioEl.play().catch();
    }
    catch (e) {
      // noop
    }
  }

  pause() {
    this.#paused = false;
    this.audioEl.autoplay = false;
    this.audioEl.pause();
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.#source.disconnect();

    this.audioEl.pause();
    this.audioEl.src = '';
  }
}
