import {Drawable} from "../drawables/Drawable.ts";
import {Inject} from "../drawables/di";
import {EditorInstance} from "../editorClient.ts";
import {AudioManager} from "./AudioManager.ts";
import {EditorClock} from "../clock.ts";
import {HitSample, SampleSet, SampleType} from "@osucad/common";
import {AudioPlayback} from "./AudioPlayback.ts";

export class HitSoundPlayer extends Drawable {

  @Inject(EditorInstance) editor!: EditorInstance;
  @Inject(AudioManager) audioManager!: AudioManager;
  @Inject(EditorClock) clock!: EditorClock;

  private _scheduledHitSamples = new Set<AudioPlayback>();
  private _isPlaying = false;
  private _hitSound?: AudioBuffer;
  private _tabIsActive = true;

  private _hitSounds: {
    [sampleSet in SampleSet]?: {
      [sampleType in SampleType]?: AudioBuffer
    }
  } = {
    [SampleSet.Normal]: {},
    [SampleSet.Soft]: {},
    [SampleSet.Drum]: {},
  };

  constructor() {
    super();

    this.init();
  }

  init() {
    const sampleSets = [SampleSet.Normal, SampleSet.Soft, SampleSet.Drum];
    const sampleTypes = [SampleType.Normal, SampleType.Whistle, SampleType.Finish, SampleType.Clap];
    for (const sampleSet of sampleSets) {
      for (const sampleType of sampleTypes) {
        let sampleName = "";
        switch (sampleSet) {
          case SampleSet.Normal:
            sampleName += "normal-";
            break;
          case SampleSet.Soft:
            sampleName += "soft-";
            break;
          case SampleSet.Drum:
            sampleName += "drum-";
            break;
        }
        switch (sampleType) {
          case SampleType.Normal:
            sampleName += "hitnormal";
            break;
          case SampleType.Whistle:
            sampleName += "hitwhistle";
            break;
          case SampleType.Finish:
            sampleName += "hitfinish";
            break;
          case SampleType.Clap:
            sampleName += "hitclap";
            break;
        }

        const sampleUrl = `/hitsounds/${sampleName}.wav`;

        fetch(sampleUrl).then(async response => {
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.audioManager.context.decodeAudioData(arrayBuffer);
          console.log("loaded", sampleName);
          if (this._hitSounds[sampleSet])
            this._hitSounds[sampleSet]![sampleType] = audioBuffer;
        });
      }
    }
  }


  onLoad() {
    useEventListener("focus", () => {
      this._tabIsActive = true;
    });
    useEventListener("blur", () => {
      this._tabIsActive = false;
    });
  }

  onTick() {
    if (!this.clock.isPlaying || !this._tabIsActive) {
      this._isPlaying = false;
      if (this._scheduledHitSamples.size > 0) {
        for (const playback of this._scheduledHitSamples) {
          playback.stop();
        }
        this._scheduledHitSamples.clear();
      }
      return;
    }

    const offset = 100;

    let startTime = this.clock.currentTime + offset - this.clock.deltaTime;
    let endTime = this.clock.currentTime + offset;


    if (!this._isPlaying)
      startTime = this.clock.currentTime;
    this._isPlaying = true;

    const hitObjects = this.editor.beatmapManager.hitObjects.hitObjects.filter(hitObject => {
      return hitObject.startTime <= endTime && hitObject.endTime > startTime;
    });

    const hitSamples: HitSample[] = [];

    for (const hitObject of hitObjects) {
      hitSamples.push(...hitObject.hitSamples);
    }

    for (const sample of hitSamples) {
      if (sample.time >= startTime && sample.time <= endTime) {
        this.playSample(sample);
      }
    }
  }

  playSample(sample: HitSample) {

    let sampleSet = sample.sampleSet;
    if (sampleSet === SampleSet.Auto) {
      sampleSet = SampleSet.Soft;
    }

    const buffer = this._hitSounds[sampleSet]?.[sample.type];
    console.log(buffer);

    if (!buffer) return;

    const delay = ((sample.time - this.clock.currentTime) / this.clock.playbackRate) / 1000;

    const playback = this.audioManager.playSound({
      buffer,
      delay: Math.max(0, delay + 0.03),
      volume: 0.4,
    });


    this._scheduledHitSamples.add(playback);
    playback.onended = () => {
      this._scheduledHitSamples.delete(playback);
    };
  }

}