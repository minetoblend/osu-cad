import {
  AudioChannel,
  AudioManager, Bindable,
} from 'osucad-framework';
import {
  Container,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { PreferencesStore } from '../preferences/PreferencesStore';
import { OsucadConfigManager } from '../config/OsucadConfigManager.ts';
import { OsucadSettings } from '../config/OsucadSettings.ts';

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

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  masterVolume = new Bindable(100);

  musicVolume = new Bindable(100);

  hitsoundVolume = new Bindable(100);

  uiVolume = new Bindable(100);

  @dependencyLoader()
  load() {
    this.masterVolume.addOnChangeListener(e => this.audioManager.masterVolume = Math.pow(e.value / 100, 2));
    this.musicVolume.addOnChangeListener(e => this.music.volume = Math.pow(e.value / 100, 2));
    this.hitsoundVolume.addOnChangeListener(e => this.hitsounds.volume = Math.pow(e.value / 100, 2));
    this.uiVolume.addOnChangeListener(e => this.userInterface.volume = Math.pow(e.value / 100, 2));

    this.config.bindWith(OsucadSettings.MasterVolume, this.masterVolume);
    this.config.bindWith(OsucadSettings.MusicVolume, this.musicVolume);
    this.config.bindWith(OsucadSettings.HitsoundVolume, this.hitsoundVolume);
    this.config.bindWith(OsucadSettings.UIVolume, this.uiVolume);
  }
}
