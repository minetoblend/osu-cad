import type { SamplePlayback } from 'osucad-framework';
import type { OsuHitObject } from '../beatmap/hitObjects/OsuHitObject';
import type { HitSample } from '../beatmap/hitSounds/HitSample';
import type { LifetimeEntry } from '../pooling/LifetimeEntry';
import { Action, BindableNumber, CompositeDrawable, dependencyLoader, FramedClock, OffsetClock, resolved } from 'osucad-framework';
import { HitObjectList } from '../beatmap/hitObjects/HitObjectList';
import { SampleType } from '../beatmap/hitSounds/SampleType';
import { OsucadConfigManager } from '../config/OsucadConfigManager';
import { OsucadSettings } from '../config/OsucadSettings';
import { LifetimeBoundaryCrossingDirection } from '../pooling/LifetimeBoundaryCrossingDirection';
import { LifetimeBoundaryKind } from '../pooling/LifetimeBoundaryKind';
import { LifetimeEntryManager } from '../pooling/LifetimeEntryManager';
import { BeatmapSampleStore } from './BeatmapSampleStore';
import { EditorContext } from './context/EditorContext';
import { EditorClock } from './EditorClock';
import { HitObjectLifetimeEntry } from './hitobjects/HitObjectLifetimeEntry';

export class HitsoundPlayer extends CompositeDrawable {
  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(EditorContext)
  editorContext!: EditorContext;

  samplePlayed = new Action<HitSample>();

  #offsetClock!: OffsetClock;

  #lifetimeManager = new LifetimeEntryManager();

  audioOffset = new BindableNumber();

  hitSoundOffset = new BindableNumber();

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @dependencyLoader()
  load() {
    this.config.bindWith(OsucadSettings.AudioOffset, this.audioOffset);
    this.config.bindWith(OsucadSettings.HitSoundOffset, this.hitSoundOffset);

    this.#offsetClock = new OffsetClock(this.editorClock, -(this.audioOffset.value + this.hitSoundOffset.value));

    this.clock = new FramedClock(this.#offsetClock);

    this.audioOffset.addOnChangeListener(() => this.#offsetClock.offset = -(this.audioOffset.value + this.hitSoundOffset.value));
    this.hitSoundOffset.addOnChangeListener(() => this.#offsetClock.offset = -(this.audioOffset.value + this.hitSoundOffset.value));

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

  @resolved(BeatmapSampleStore)
  sampleStore!: BeatmapSampleStore;

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
  }

  #playSample(entry: HitSoundLifetimeEntry, hitSample: HitSample) {
    if (!this.editorClock.isRunning)
      return;

    const isLooping = hitSample.sampleType === SampleType.SliderSlide || hitSample.sampleType === SampleType.SliderWhistle;

    const sample = this.sampleStore.getSample(hitSample);

    const delay = (hitSample.time - this.time.current) / this.editorClock.rate;

    if (sample) {
      const playback = sample.play({
        delay: Math.max(delay, 0),
        volume: hitSample.volume / 100,
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

    for (const entry of this.#lifetimeManager.activeEntries) {
      const samples = (entry as HitSoundLifetimeEntry).loopingSamples;
      for (const sample of samples) {
        sample.stop();
      }
    }

    console.log('dispose hitsound player');

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
