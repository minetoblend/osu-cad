import type { Sample, SamplePlayback } from 'osucad-framework';
import type { HitSample } from '../../../../hitsounds/HitSample';
import type { DrawableOsuHitObject } from './DrawableOsuHitObject';
import { Component, dependencyLoader, resolved } from 'osucad-framework';
import { AudioMixer } from '../../../../audio/AudioMixer';
import { DrawableHitObject } from '../../../../hitObjects/drawables/DrawableHitObject';
import { ISkinSource } from '../../../../skinning/ISkinSource';

export class DrawableHitSound extends Component {
  constructor() {
    super();
  }

  @resolved(AudioMixer)
  mixer!: AudioMixer;

  @resolved(ISkinSource)
  skin!: ISkinSource;

  @resolved(DrawableHitObject)
  drawableHitObject!: DrawableOsuHitObject;

  get channel() {
    return this.mixer.hitsounds;
  }

  @dependencyLoader()
  load() {
    this.skin.sourceChanged.addListener(this.#skinChanged, this);
  }

  loadSamples() {
    this.#loadSamples();
  }

  #skinChanged() {
    this.stopAllSamples();
    this.scheduler.addOnce(this.#loadSamples, this);
  }

  #hitSamples: HitSample[] = [];

  #loadSamples() {
    this.#hitSamples = [...this.drawableHitObject.getHitSamples()];
  }

  #activeSamples = new Set<SamplePlayback>();

  play() {
    for (const s of this.#hitSamples) {
      const sample = this.skin.getSample(this.mixer.hitsounds, s);
      if (!sample)
        continue;

      this.#playSample(sample, s.time - this.time.current, s.volume / 100);
    }
  }

  #playSample(sample: Sample, delay: number, volume: number) {
    // if (delay > 0) {
    //   this.scheduler.addDelayed(() => this.#playSample(sample, 0, volume), delay);
    //   return;
    // }

    const playback = sample.play({ volume });
    this.#activeSamples.add(playback);

    playback.onEnded.addListener(() => this.#activeSamples.delete(playback), this);
  }

  stopAllSamples() {
    for (const s of this.#activeSamples)
      s.stop();

    this.#activeSamples.clear();
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    for (const s of this.#activeSamples)
      s.stop();

    this.skin.sourceChanged.removeListener(this.#skinChanged, this);
  }
}
