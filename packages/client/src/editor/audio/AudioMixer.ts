import { usePreferences } from "@/composables/usePreferences.ts";

export class AudioMixer {
  constructor(ctx: AudioContext) {
    this.master = ctx.createGain();
    this.music = ctx.createGain();
    this.ui = ctx.createGain();
    this.hitsounds = ctx.createGain();

    this.music.connect(this.master);
    this.ui.connect(this.master);
    this.hitsounds.connect(this.master);

    this.master.connect(ctx.destination);

    const { preferences, loaded } = usePreferences();

    watchEffect(() => {
      if (!loaded.value) return;

      this.master.gain.value = preferences.audio.masterVolume / 100;
      this.music.gain.value = preferences.audio.musicVolume / 100;
      this.ui.gain.value = preferences.audio.uiVolume / 100;
      this.hitsounds.gain.value = preferences.audio.hitsoundVolume / 100;
    });
  }

  readonly master: GainNode;
  readonly music: GainNode;
  readonly ui: GainNode;
  readonly hitsounds: GainNode;
}
