import type { Sample, SamplePlayback } from 'osucad-framework';
import {
  Action,
  AudioManager,
  CompositeDrawable,
  dependencyLoader,
  FramedClock,
  OffsetClock,
  resolved,
} from 'osucad-framework';
import { PreferencesStore } from '../preferences/PreferencesStore';
import { HitObjectList } from '../beatmap/hitObjects/HitObjectList';
import type { HitSample } from '../beatmap/hitSounds/HitSample';
import { SampleSet } from '../beatmap/hitSounds/SampleSet';
import { SampleType } from '../beatmap/hitSounds/SampleType';
import { EditorClock } from './EditorClock';
import { EditorContext } from './context/EditorContext';
import { EditorMixer } from './EditorMixer';
import { ISkinSource } from '../skinning/ISkinSource.ts';
import { LifetimeEntryManager } from '../pooling/LifetimeEntryManager.ts';
import { LifetimeEntry } from '../pooling/LifetimeEntry.ts';
import { HitObjectLifetimeEntry } from './hitobjects/HitObjectLifetimeEntry.ts';
import { OsuHitObject } from '../beatmap/hitObjects/OsuHitObject.ts';
import { LifetimeBoundaryKind } from '../pooling/LifetimeBoundaryKind.ts';
import { LifetimeBoundaryCrossingDirection } from '../pooling/LifetimeBoundaryCrossingDirection.ts';

export class HitsoundPlayer extends CompositeDrawable {
  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(EditorContext)
  editorContext!: EditorContext;

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  samplePlayed = new Action<HitSample>();

  #offsetClock!: OffsetClock;

  #lifetimeManager = new LifetimeEntryManager();

  @dependencyLoader()
  load() {
    this.loadAssets();


    this.#offsetClock = new OffsetClock(this.editorClock, -this.preferences.audio.audioOffset);

    this.clock = new FramedClock(this.#offsetClock);

    this.preferences.audio.audioOffsetBindable.addOnChangeListener((offset) => {
      this.#offsetClock.offset = -offset.value;
    });

    this.#lifetimeManager.entryBecameAlive.addListener(this.#onEntryBecameAlive, this);
    this.#lifetimeManager.entryBecameDead.addListener(this.#onEntryBecameDead, this);
    this.#lifetimeManager.entryCrossedBoundary.addListener(this.#onEntryCrossedBoundary, this);

    this.hitObjects.added.addListener(this.#onHitObjectAdded, this);
    this.hitObjects.removed.addListener(this.#onHitObjectRemoved, this);

    for (const hitObject of this.hitObjects) {
      this.#onHitObjectAdded(hitObject);
    }
  }

  #onEntryBecameAlive(entry: LifetimeEntry) {
    const hitObject = (entry as HitSoundLifetimeEntry).hitObject as OsuHitObject;

    if (this.time.elapsed > 200 || !this.editorClock.isRunning || this.editorClock.isSeeking)
      return;

    for (const sample of hitObject.hitSamples) {
      this.#playSample(entry as HitSoundLifetimeEntry, sample);
    }
  }

  #onEntryCrossedBoundary([entry, boundaryKind, crossingDirection]: [LifetimeEntry, LifetimeBoundaryKind, LifetimeBoundaryCrossingDirection]) {
    const hitObject = (entry as HitSoundLifetimeEntry).hitObject as OsuHitObject;

    if (this.time.elapsed > 500 || !this.editorClock.isRunning || this.editorClock.isSeeking)
      return;

    if (hitObject.duration === 0 && boundaryKind === LifetimeBoundaryKind.Start && crossingDirection === LifetimeBoundaryCrossingDirection.Forward) {
      for (const sample of hitObject.hitSamples) {
        this.#playSample(entry as HitSoundLifetimeEntry, sample);
      }
    }

  }

  #onEntryBecameDead(entry: LifetimeEntry) {
    for (const playback of (entry as HitSoundLifetimeEntry).loopingSamples) {
      playback.stop();
    }

    (entry as HitSoundLifetimeEntry).loopingSamples = [];
  }

  #entries = new Map<OsuHitObject, HitObjectLifetimeEntry>();

  #onHitObjectAdded(hitObject: OsuHitObject) {
    const lifetimeEntry = new HitSoundLifetimeEntry(hitObject);
    this.#lifetimeManager.addEntry(lifetimeEntry);

    this.#entries.set(hitObject, lifetimeEntry);
  }

  #onHitObjectRemoved(hitObject: OsuHitObject) {
    const lifetimeEntry = this.#entries.get(hitObject);
    if (lifetimeEntry) {
      this.#lifetimeManager.removeEntry(lifetimeEntry);

      this.#entries.delete(hitObject);
    }
  }

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(EditorMixer)
  mixer!: EditorMixer;

  samples = new Map<string, Sample>();
  defaultSamples = new Map<string, Sample>();

  loadAssets() {
    const sampleSets = ['normal', 'soft', 'drum'];
    const additions = ['hitnormal', 'hitwhistle', 'hitfinish', 'hitclap', 'sliderslide', 'sliderwhistle'];

    const sampleFilenames = sampleSets.flatMap(sampleSet => additions.map(addition => `${sampleSet}-${addition}`));

    const found = new Set<string>();

    const resources = this.editorContext.resources.getAvailableResources();

    const audioFilename = /([\w-]+(\d*)).(?:wav|mp3|ogg)/;

    for (const asset of resources) {

      const match = asset.match(audioFilename);

      if (!match)
        continue;

      const [, key] = match;

      if (!key)
        continue;

      const data = this.editorContext.getResource(asset);
      if (!data)
        continue;

      found.add(key);

      this.audioManager
        .createSampleFromArrayBuffer(this.mixer.hitsounds, data)
        .then(sample => this.samples.set(key, sample))
        .catch(err => console.warn(`Failed to decode audio for "${key}"`, err));
    }

    for (const key of sampleFilenames) {
      if (found.has(key))
        continue;

      this.skin.getSample(this.mixer.hitsounds, key).then(sample => {
        if (!sample) {
          console.warn(`Could not find sample for ${key}`);
          return;
        }

        this.samples.set(key, sample);
      });
    }
  }

  @resolved(ISkinSource)
  skin!: ISkinSource;

  @resolved(HitObjectList)
  hitObjects!: HitObjectList;

  #scheduledSamples: SamplePlayback[] = [];

  lastEndTime = 0;

  #wasPlaying = false;

  update() {
    super.update();

    const isPlaying = this.editorClock.isRunning;

    if (isPlaying && !this.#wasPlaying) {
      for (const entry of this.#lifetimeManager.activeEntries) {

        for (const sample of (entry as HitSoundLifetimeEntry).hitObject.hitSamples) {
          if (sample.time >= this.editorClock.currentTime)
            this.#playSample(entry as HitSoundLifetimeEntry, sample);
        }
      }
    }

    this.#wasPlaying = isPlaying;

    if (!isPlaying) {
      this.#scheduledSamples.forEach(sample => sample.stop());
      this.#scheduledSamples.length = 0;
    }

    this.#lifetimeManager.update(this.time.current);
    return;
  }


  #playSample(entry: HitSoundLifetimeEntry, hitSample: HitSample) {
    if (!this.editorClock.isRunning)
      return;

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
        type = 'hitnormal';
        break;
      case SampleType.Whistle:
        type = 'hitwhistle';
        break;
      case SampleType.Finish:
        type = 'hitfinish';
        break;
      case SampleType.Clap:
        type = 'hitclap';
        break;
      case SampleType.SliderSlide:
        type = 'sliderslide';
        isLooping = true;
        break;
      case SampleType.SliderWhistle:
        type = 'sliderwhistle';
        isLooping = true;
        break;
    }

    const key = `${sampleSet}-${type}`;

    const index = hitSample.index === 0 ? '' : hitSample.index.toString();

    const sample
      = this.samples.get(key + index)
      ?? this.samples.get(key);

    const delay = (hitSample.time - this.time.current) / this.editorClock.rate;

    if (sample) {
      const playback = sample.play({
        delay: Math.max(delay, 0),
        volume: hitSample.volume,
        loop: isLooping,
      });

      if (isLooping) {
        entry.loopingSamples.push(playback);
      }

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

  override dispose(isDisposing: boolean = true) {
    for (const playback of this.#scheduledSamples) {
      playback.stop();
    }

    super.dispose(isDisposing);
  }
}

class HitSoundLifetimeEntry extends HitObjectLifetimeEntry {
  constructor(hitObject: OsuHitObject) {
    super(hitObject);
  }

  loopingSamples: SamplePlayback[] = [];

  get initialLifetimeOffset() {
    return 0;
  }

  protected setInitialLifetime() {
    super.setInitialLifetime();

    this.lifetimeEnd = this.hitObject.endTime;
  }

  override hitObject!: OsuHitObject;
}
