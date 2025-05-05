import type { AudioChannel } from "../AudioChannel";
import { SamplePlayback } from "./SamplePlayback";

export interface SamplePlayOptions 
{
  rate?: number;
  volume?: number;
  offset?: number;
  delay?: number;
  loop?: boolean;
}

export class Sample 
{
  constructor(
    readonly context: AudioContext,
    readonly channel: AudioChannel,
    readonly buffer: AudioBuffer,
  ) 
  {}

  name?: string;

  get length() 
  {
    return this.buffer.duration * 1000;
  }

  play(options: SamplePlayOptions = {}): SamplePlayback 
  {
    const source = this.context.createBufferSource();
    source.buffer = this.buffer;

    source.loop = !!options.loop;

    if (options.rate) 
    {
      source.playbackRate.value = options.rate;
    }

    let destination = this.channel.input;

    let gain: GainNode | undefined;

    if (options.volume !== undefined && options.volume !== 1) 
    {
      const gain = this.context.createGain();
      gain.gain.value = options.volume;
      gain.connect(destination);
      destination = gain;
    }

    source.connect(destination);

    const playback = new SamplePlayback(source, this.context, this.channel);

    source.onended = () => 
    {
      if (gain) 
      {
        gain.disconnect();
      }

      source.disconnect();

      playback.onEnded.emit(playback);
    };

    source.start(
      options.delay ? this.context.currentTime + options.delay / 1000 : undefined,
      options.offset ? options.offset / 1000 : undefined,
    );

    return playback;
  }
}
