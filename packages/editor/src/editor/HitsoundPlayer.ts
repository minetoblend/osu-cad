import type {
  Sample,
  SamplePlayback,
} from 'osucad-framework';
import {
  Action,
  AudioManager,
  CompositeDrawable,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import type {
  HitSample,
} from '@osucad/common';
import {
  HitObjectManager,
  SampleSet,
  SampleType,
} from '@osucad/common';
import { PreferencesStore } from '../preferences/PreferencesStore';
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

  @dependencyLoader()
  load() {
    this.loadAssets(this.editorContext.beatmapAssets.value);
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

  @resolved(HitObjectManager)
  hitObjects!: HitObjectManager;

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

    const offset = 100 - this.preferences.audio.audioOffset;

    let startTime = this.lastEndTime;

    const endTime = Math.floor(this.editorClock.currentTime + offset);

    this.lastEndTime = endTime;

    const accurateStartTime = Math.floor(this.editorClock.currentTime - this.editorClock.timeInfo.elapsed + offset);

    if (Math.abs(accurateStartTime - startTime) > 10) {
      startTime = accurateStartTime;
    }

    if (!this.#isPlaying) {
      startTime = this.editorClock.currentTime - 10;
    }

    startTime = Math.floor(startTime);

    this.#isPlaying = true;

    const hitObjects = this.hitObjects.hitObjects.filter(
      hitObject =>
        hitObject.startTime <= endTime + 10 && hitObject.endTime >= startTime - 10,
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

    switch (hitSample.type) {
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
    }

    const key = `${sampleSet}-hit${type}`;

    const index = hitSample.index === 0 ? '' : hitSample.index.toString();

    const sample
      = this.samples.get(key)
      ?? this.samples.get(key + index)
      ?? this.defaultSamples.get(key);

    const delay
      = (hitSample.time - this.editorClock.currentTime + this.preferences.audio.audioOffset) / this.editorClock.rate;

    if (!sample) {
      console.log(`Sample not found: ${key}`);
    }

    if (sample) {
      const playback = sample.play({
        delay: Math.max(delay, 0),
        volume: hitSample.volume * 0.4,
      });
      this.#scheduledSamples.push(playback);

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
