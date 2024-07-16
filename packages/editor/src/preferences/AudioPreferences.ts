import { Bindable } from 'osucad-framework';

const key = 'preferences:audio';

export class AudioPreferences {
  init() {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);

      this.masterVolumeBindable.value = parsed.masterVolume;
      this.musicVolumeBindable.value = parsed.musicVolume;
      this.hitsoundVolumeBindable.value = parsed.hitsoundVolume;
      this.uiVolumeBindable.value = parsed.uiVolume;
      this.audioOffsetBindable.value = parsed.audioOffset ?? 0;
    }

    this.masterVolumeBindable.addOnChangeListener(() => this.save());
    this.musicVolumeBindable.addOnChangeListener(() => this.save());
    this.hitsoundVolumeBindable.addOnChangeListener(() => this.save());
    this.uiVolumeBindable.addOnChangeListener(() => this.save());
  }

  get masterVolume() {
    return this.masterVolumeBindable.value;
  }

  set masterVolume(value: number) {
    this.masterVolumeBindable.value = value;
  }

  get musicVolume() {
    return this.musicVolumeBindable.value;
  }

  set musicVolume(value: number) {
    this.musicVolumeBindable.value = value;
  }

  get hitsoundVolume() {
    return this.hitsoundVolumeBindable.value;
  }

  set hitsoundVolume(value: number) {
    this.hitsoundVolumeBindable.value = value;
  }

  get uiVolume() {
    return this.uiVolumeBindable.value;
  }

  set uiVolume(value: number) {
    this.uiVolumeBindable.value = value;
  }

  get audioOffset() {
    return this.audioOffsetBindable.value;
  }

  set audioOffset(value: number) {
    this.audioOffsetBindable.value = value;
  }

  masterVolumeBindable = new Bindable(0.5);
  musicVolumeBindable = new Bindable(0.75);
  hitsoundVolumeBindable = new Bindable(0.75);
  uiVolumeBindable = new Bindable(0.5);
  audioOffsetBindable = new Bindable(0);

  private save() {
    localStorage.setItem(
      key,
      JSON.stringify({
        masterVolume: this.masterVolume,
        musicVolume: this.musicVolume,
        hitsoundVolume: this.hitsoundVolume,
        uiVolume: this.uiVolume,
      }),
    );
  }
}
