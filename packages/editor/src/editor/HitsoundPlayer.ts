import type { Sample, SamplePlayback } from 'osucad-framework';
import { Action, AudioManager, CompositeDrawable, FramedClock, OffsetClock, dependencyLoader, resolved } from 'osucad-framework';
import { PreferencesStore } from '../preferences/PreferencesStore';
import { HitObjectList } from '../beatmap/hitObjects/HitObjectList';
import type { HitSample } from '../beatmap/hitSounds/HitSample';
import { SampleSet } from '../beatmap/hitSounds/SampleSet';
import { SampleType } from '../beatmap/hitSounds/SampleType';
import { EditorClock } from './EditorClock';
import { EditorContext } from './context/EditorContext';
import type { BeatmapAsset } from './context/BeatmapAsset';
import { EditorMixer } from './EditorMixer';

export class HitsoundPlayer extends CompositeDrawable {
  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(EditorContext)
  editorContext!: EditorContext;

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  samplePlayed = new Action<HitSample>();

  #offsetClock!: OffsetClock;

  @dependencyLoader()
  load() {
    this.loadAssets(this.editorContext.beatmapAssets.value);

    this.#offsetClock = new OffsetClock(this.editorClock, -this.preferences.audio.audioOffset);

    this.clock = new FramedClock(this.#offsetClock);

    this.preferences.audio.audioOffsetBindable.addOnChangeListener((offset) => {
      this.#offsetClock.offset = -offset.value;
    });
  }

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(EditorMixer)
  mixer!: EditorMixer;

  samples = new Map<string, Sample>();
  defaultSamples = new Map<string, Sample>();

  loadAssets(assets: BeatmapAsset[]) {
    const sampleSets = ['normal', 'soft', 'drum'];
    const additions = ['normal', 'whistle', 'finish', 'clap'];

    for (const sampleSet of sampleSets) {
      for (const addition of additions) {
        const key = `${sampleSet}-hit${addition}`;

        fetch(`/assets/skin/${sampleSet}-hit${addition}.wav`)
          .then(res => res.arrayBuffer())
          .then(buffer => this.audioManager.context.decodeAudioData(buffer))
          .then((audioBuffer) => {
            const sample = this.audioManager.createSample(
              this.mixer.hitsounds,
              audioBuffer,
            );

            this.defaultSamples.set(key, sample);
          });
      }
    }

    const regex = /(\w+)-hit(\w+)?\.(wav|mp3|ogg)/;

    for (const asset of assets) {
      const match = asset.path.match(regex);
      if (!match)
        continue;

      const key = `${match[1]}-hit${match[2]}`;

      fetch(asset.url)
        .then(res => res.arrayBuffer())
        .then(buffer => this.audioManager.context.decodeAudioData(buffer))
        .then((audioBuffer) => {
          const sample = this.audioManager.createSample(
            this.mixer.hitsounds,
            audioBuffer,
          );

          this.samples.set(key, sample);
        });
    }
  }

  @resolved(HitObjectList)
  hitObjects!: HitObjectList;

  #scheduledSamples: SamplePlayback[] = [];

  lastEndTime = 0;

  update() {
    super.update();

    if (!this.editorClock.isRunning) {
      this.#scheduledSamples.forEach(sample => sample.stop());
      this.#scheduledSamples.length = 0;
      this.#isPlaying = false;
      return;
    }

    // requestAnimationFrame() doesn't get called when the page isn't visible,
    // so we need to skip this update in that case to prevent all the samples that
    // should have been played during that time from playing all at once
    if (Math.abs(this.time.current - this.lastEndTime) > 1000) {
      return;
    }

    let startTime = this.lastEndTime;

    const endTime = Math.floor(this.time.current);

    this.lastEndTime = endTime;

    if (!this.#isPlaying) {
      startTime = this.editorClock.currentTime - 10;
    }

    startTime = Math.floor(startTime);

    this.#isPlaying = true;

    const hitObjects = this.hitObjects.filter(
      hitObject =>
        hitObject.startTime <= endTime && hitObject.endTime >= startTime,
    );

    const hitSamples = hitObjects.flatMap(it => it.hitSamples);

    for (const sample of hitSamples) {
      if (sample.time > startTime && sample.time <= endTime) {
        this.#playSample(sample);
      }
    }
  }

  #playSample(hitSample: HitSample) {
    let sampleSet = 'soft';

    switch (hitSample.sampleSet) {
      case SampleSet.Auto:
      case SampleSet.Soft:
        sampleSet = 'soft';
        break;
      case SampleSet.Normal:
        sampleSet = 'normal';
        break;
      case SampleSet.Drum:
        sampleSet = 'drum';
        break;
    }

    let type = 'normal';

    let isLooping = false;

    switch (hitSample.sampleType) {
      case SampleType.Normal:
        type = 'normal';
        break;
      case SampleType.Whistle:
        type = 'whistle';
        break;
      case SampleType.Finish:
        type = 'finish';
        break;
      case SampleType.Clap:
        type = 'clap';
        break;
      case SampleType.SliderSlider:
        type = 'sliderslide';
        isLooping = true;
        break;
    }

    const key = `${sampleSet}-hit${type}`;

    const index = hitSample.index === 0 ? '' : hitSample.index.toString();

    const sample
      = this.samples.get(key)
      ?? this.samples.get(key + index)
      ?? this.defaultSamples.get(key);

    const delay = (hitSample.time - this.time.current) / this.editorClock.rate;

    if (!sample) {
      console.log(`Sample not found: ${key}`);
    }

    if (sample) {
      const playback = sample.play({
        delay: Math.max(delay, 0),
        volume: hitSample.volume,
        loop: hitSample.sampleType === SampleType.SliderSlider,
      });

      playback.onEnded.addListener(() => {
        const index = this.#scheduledSamples.indexOf(playback);
        if (index !== -1) {
          this.#scheduledSamples.splice(index, 1);
        }
      });

      this.scheduler.addDelayed(() => {
        this.samplePlayed.emit(hitSample);
      }, delay);
    }
  }

  #isPlaying = false;
}

class SlideSample {
  constructor(
    readonly sample: HitSample,
    readonly playback: SamplePlayback,
  ) {
  }

  get startTime() {
    return this.sample.time;
  }

  get endTime() {
    return this.sample.duration ?? 0;
  }

  started = false;
}
