import { AudioPreferences } from './AudioPreferences';

export class PreferencesStore {
  readonly audio = new AudioPreferences();

  init() {
    this.audio.init();
  }
}
