interface AudioPlaybackOptions {
  source: AudioBufferSourceNode;
  offset: number;
  startTime: number;
  duration?: number;
  volume: number;
  playbackRate: number;
  balance: number;
  onended?: () => void;
}

export class AudioPlayback {
  constructor(options: AudioPlaybackOptions) {
    this.source = options.source;
    this.startTime = options.startTime;
    this.offset = options.offset;
    this.duration = options.duration;
    this.volume = options.volume;
    this.playbackRate = options.playbackRate;
    this.balance = options.balance;
    this._onEnded = options.onended;

    this.source.onended = () => {
      this._onEnded?.();
      this.onended?.(this);
    };
  }

  public readonly source: AudioBufferSourceNode;
  public readonly startTime: number;
  public readonly offset: number;
  public readonly duration: number | undefined;
  public readonly volume: number;
  public readonly playbackRate: number;
  public readonly balance: number;

  private readonly _onEnded?: () => void;

  onended?: (playback: AudioPlayback) => void;

  stop() {
    this.source.stop();
    this.source.disconnect();
    this._onEnded?.();
    this.onended?.(this);
  }
}
