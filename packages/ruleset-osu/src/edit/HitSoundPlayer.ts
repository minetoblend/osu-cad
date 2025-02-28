import type { EditorClock, HitObject, HitSample, LifetimeEntry } from '@osucad/core';
import type { ReadonlyDependencyContainer, SamplePlayback } from '@osucad/framework';
import { AudioMixer, EditorBeatmap, HitObjectLifetimeEntry, ISkinSource, LifetimeBoundaryCrossingDirection, LifetimeBoundaryKind, LifetimeEntryManager, OsucadConfigManager, OsucadSettings, PlayfieldClock, SampleType } from '@osucad/core';
import { Action, BindableNumber, Component, FramedClock, OffsetClock, resolved } from '@osucad/framework';
import { OsuHitObject } from '../hitObjects/OsuHitObject';

export class HitSoundPlayer extends Component {
  @resolved(() => PlayfieldClock)
  editorClock!: EditorClock;

  samplePlayed = new Action<HitSample>();

  #offsetClock!: OffsetClock;

  #lifetimeManager = new LifetimeEntryManager();

  audioOffset = new BindableNumber();

  hitSoundOffset = new BindableNumber();

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
    this.config.bindWith(OsucadSettings.AudioOffset, this.audioOffset);
    this.config.bindWith(OsucadSettings.HitSoundOffset, this.hitSoundOffset);

    this.#offsetClock = new OffsetClock(this.editorClock, -(this.audioOffset.value + this.hitSoundOffset.value));

    this.clock = new FramedClock(this.#offsetClock);
    this.processCustomClock = true;

    this.audioOffset.addOnChangeListener(() => this.#offsetClock.offset = -(this.audioOffset.value + this.hitSoundOffset.value));
    this.hitSoundOffset.addOnChangeListener(() => this.#offsetClock.offset = -(this.audioOffset.value + this.hitSoundOffset.value));

    this.#lifetimeManager.entryBecameAlive.addListener(this.#onEntryBecameAlive, this);
    this.#lifetimeManager.entryBecameDead.addListener(this.#onEntryBecameDead, this);
    this.#lifetimeManager.entryCrossedBoundary.addListener(this.#onEntryCrossedBoundary, this);
  }

  protected override loadComplete() {
    super.loadComplete();

    for (const hitObject of this.beatmap.hitObjects)
      this.addHitObject(hitObject);

    this.beatmap.hitObjects.added.addListener(this.addHitObject, this);
    this.beatmap.hitObjects.removed.addListener(this.removeHitObject, this);
  }

  #onEntryBecameAlive(entry: LifetimeEntry) {
    const hitObject = (entry as HitSoundLifetimeEntry).hitObject as OsuHitObject;

    if (this.time.elapsed > 200 || !this.editorClock.isRunning || this.editorClock.isSeeking)
      return;

    for (const sample of hitObject.hitSamples)
      this.#playSample(entry as HitSoundLifetimeEntry, sample);
  }

  #onEntryCrossedBoundary([entry, boundaryKind, crossingDirection]: [LifetimeEntry, LifetimeBoundaryKind, LifetimeBoundaryCrossingDirection]) {
    const hitObject = (entry as HitSoundLifetimeEntry).hitObject as OsuHitObject;

    if (this.time.elapsed > 500 || !this.editorClock.isRunning || this.editorClock.isSeeking)
      return;

    if (hitObject.duration === 0 && boundaryKind === LifetimeBoundaryKind.Start && crossingDirection === LifetimeBoundaryCrossingDirection.Forward) {
      for (const sample of hitObject.hitSamples)
        this.#playSample(entry as HitSoundLifetimeEntry, sample);
    }
  }

  #onEntryBecameDead(entry: LifetimeEntry) {
    for (const playback of (entry as HitSoundLifetimeEntry).loopingSamples) {
      playback.stop();
    }

    (entry as HitSoundLifetimeEntry).loopingSamples = [];
  }

  #entries = new Map<OsuHitObject, HitObjectLifetimeEntry>();

  protected addHitObject(hitObject: HitObject) {
    if (!(hitObject instanceof OsuHitObject))
      return;

    const lifetimeEntry = new HitSoundLifetimeEntry(hitObject);
    this.#lifetimeManager.addEntry(lifetimeEntry);

    this.#entries.set(hitObject, lifetimeEntry);
  }

  protected removeHitObject(hitObject: HitObject) {
    if (!(hitObject instanceof OsuHitObject))
      return;

    const lifetimeEntry = this.#entries.get(hitObject);
    if (lifetimeEntry) {
      this.#lifetimeManager.removeEntry(lifetimeEntry);

      this.#entries.delete(hitObject);
    }
  }

  @resolved(EditorBeatmap)
  beatmap!: EditorBeatmap;

  #scheduledSamples: SamplePlayback[] = [];

  lastEndTime = 0;

  #wasPlaying = false;

  override update() {
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

  @resolved(() => ISkinSource)
  skin!: ISkinSource;

  @resolved(AudioMixer)
  mixer!: AudioMixer;

  #playSample(entry: HitSoundLifetimeEntry, hitSample: HitSample) {
    if (!this.editorClock.isRunning)
      return;

    const isLooping = hitSample.sampleType === SampleType.SliderSlide || hitSample.sampleType === SampleType.SliderWhistle;

    const sample = this.skin.getSample(this.mixer.hitsounds, hitSample);

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

    this.beatmap.hitObjects.added.removeListener(this.addHitObject, this);
    this.beatmap.hitObjects.removed.removeListener(this.removeHitObject, this);

    super.dispose(isDisposing);
  }
}

class HitSoundLifetimeEntry extends HitObjectLifetimeEntry {
  constructor(hitObject: OsuHitObject) {
    super(hitObject);
  }

  loopingSamples: SamplePlayback[] = [];

  override get initialLifetimeOffset() {
    return 0;
  }

  protected override setInitialLifetime() {
    super.setInitialLifetime();

    this.lifetimeEnd = this.hitObject.endTime;
  }

  override hitObject!: OsuHitObject;
}
