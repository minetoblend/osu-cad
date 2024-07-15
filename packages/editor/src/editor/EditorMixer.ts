import {
  AudioChannel,
  AudioManager,
  Container,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { PreferencesStore } from '../preferences/PreferencesStore';

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

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  @dependencyLoader()
  load() {
    const audioPreferences = this.preferences.audio;

    audioPreferences.masterVolumeBindable.addOnChangeListener(
      (value) => (this.audioManager.masterVolume = value),
      { immediate: true },
    );

    audioPreferences.musicVolumeBindable.addOnChangeListener(
      (value) => (this.music.volume = value),
      { immediate: true },
    );

    audioPreferences.hitsoundVolumeBindable.addOnChangeListener(
      (value) => (this.hitsounds.volume = value),
      { immediate: true },
    );

    audioPreferences.uiVolumeBindable.addOnChangeListener(
      (value) => (this.userInterface.volume = value),
      { immediate: true },
    );
  }
}
