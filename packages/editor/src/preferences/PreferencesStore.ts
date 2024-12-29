import { AudioPreferences } from './AudioPreferences';
import { ViewportPreferences } from './ViewportPreferences';

export class PreferencesStore {
  readonly audio = new AudioPreferences();
  readonly viewport = new ViewportPreferences();

  init() {
    this.audio.init();
    this.viewport.init();
  }
}
