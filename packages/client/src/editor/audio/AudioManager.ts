import {BeatmapManager} from "../beatmapManager.ts";
import {AudioPlayback} from "./AudioPlayback.ts";

export class AudioManager {

  _audioCache = new Map<string, AudioBuffer>();

  readonly context = new AudioContext();

  private audioBuffer!: AudioBuffer;

  private gainNode: GainNode = this.context.createGain();

  get volume() {
    return this.gainNode.gain.value;
  }

  set volume(value: number) {
    this.gainNode.gain.value = value;
    localStorage.setItem("volume", value.toString());
  }

  constructor(
    private readonly beatmapManager: BeatmapManager,
  ) {
    if (localStorage.getItem("volume"))
      this.volume = parseFloat(localStorage.getItem("volume")!);

  }

  get songDuration() {
    return this.audioBuffer.duration;
  }

  async loadAudio() {
    const response = await fetch(`/api/mapsets/${this.beatmapManager.beatmap.setId}/files/${this.beatmapManager.beatmap.audioFilename}`);
    const buffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(buffer);
    this._audioCache.set(this.beatmapManager.beatmap.audioFilename, audioBuffer);
    this.audioBuffer = audioBuffer;

    await this.context.audioWorklet.addModule("https://api.osucad.com/phaseVocoder.js");
    this.phaseVocoderNode = new AudioWorkletNode(this.context, "phase-vocoder-processor");
    this.phaseVocoderNode.connect(this.gainNode);

    this.gainNode.connect(this.context.destination);
  }

  phaseVocoderNode!: AudioWorkletNode;

  get isPlaying() {
    return !!this.source;
  }

  startTime = 0;
  contextTimeAtStart = 0;
  pauseTime?: number;
  source?: AudioBufferSourceNode;

  private _playbackRate = 1;
  get playbackRate() {
    return this._playbackRate;
  }

  set playbackRate(value: number) {
    this._update(() => {
      this._playbackRate = value;
    });
  }

  private _maintainPitch = false;

  get maintainPitch() {
    return this._maintainPitch;
  }

  set maintainPitch(value: boolean) {
    this._update(() => this._maintainPitch = value);
  }

  async play(time: number = 0, duration?: number) {
    if (this.isPlaying) {
      this.pause();
    }

    if (this.context.state !== "running")
      await this.context.resume();

    const param = this.phaseVocoderNode.parameters.get("pitchFactor") as AudioParam;
    param.value = 1 / this.playbackRate;

    const source = this.context.createBufferSource();
    source.playbackRate.value = this.playbackRate;
    source.buffer = this.audioBuffer;
    if (this._playbackRate !== 1 && this.maintainPitch)
      source.connect(this.phaseVocoderNode);
    else
      source.connect(this.gainNode);

    source.start(0, time, duration);


    this.startTime = time;
    this.contextTimeAtStart = this.context.currentTime;
    this.source = source;
    source.onended = () => {
      if (this.source === source) {
        this.pause();
      }
    };
  }

  get currentTime() {
    return (this.context.currentTime - this.contextTimeAtStart) * this._playbackRate + this.startTime;
  }

  pause(): number | undefined {
    const time = this.currentTime;
    if (this.source) {
      this.source.disconnect();
      this.source.stop();
      this.source = undefined;
      this.startTime = 0;
      this.pauseTime = time;
    }
    return time;
  }

  private _update(fn: () => void) {
    if (this.isPlaying) {
      const time = this.pause()!;
      fn();
      this.play(time);
    } else {
      fn();
    }
  }

  playSound(options: PlaySoundOptions) {
    const {
      buffer,
      offset = 0,
      duration,
      delay = 0,
      volume = 1,
      playbackRate = 1,
      balance = 0,
    } = options;

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    let destination: AudioNode = this.gainNode;

    let nodes: AudioNode[] = [source];

    if (balance !== 0) {
      const node = this.context.createStereoPanner();
      node.pan.value = balance;
      node.connect(destination);
      destination = node;
      nodes.push(node);
    }

    if (volume !== 1) {
      const node = this.context.createGain();
      node.gain.value = volume;
      node.connect(destination);
      destination = node;
      nodes.push(node);
    }

    if (playbackRate !== 1) {
      source.playbackRate.value = playbackRate;
    }

    source.connect(destination);
    source.start(delay === 0 ? 0 : this.context.currentTime + delay, offset, duration);

    const onended = () => {
      nodes.forEach(node => node.disconnect());
    };

    return new AudioPlayback({
      source,
      balance,
      startTime: this.context.currentTime + delay,
      volume,
      playbackRate,
      duration,
      offset,
      onended,
    });
  }
}

export interface PlaySoundOptions {
  buffer: AudioBuffer;
  offset?: number;
  duration?: number;
  delay?: number;

  volume?: number;
  playbackRate?: number;
  balance?: number;

}