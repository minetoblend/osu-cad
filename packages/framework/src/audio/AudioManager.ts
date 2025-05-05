import { AudioChannel } from "./AudioChannel";
import { Sample } from "./sample/Sample";
import { AudioBufferTrack } from "./track/AudioBufferTrack";
import { AudioElementTrack } from "./track/AudioElementTrack";

export class AudioManager 
{
  constructor() 
  {
    this.context = new AudioContext({ latencyHint: "interactive" });
    this.#setupContextAutostart();

    this.#gain = this.context.createGain();
    this.#gain.connect(this.context.destination);
  }

  readonly context: AudioContext;

  createTrack(channel: AudioChannel, buffer: AudioBuffer) 
  {
    return new AudioBufferTrack(this.context, channel, buffer);
  }

  async createTrackFromArrayBuffer(channel: AudioChannel, buffer: ArrayBuffer) 
  {
    const dest = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(dest).set(new Uint8Array(buffer));

    return this.context.decodeAudioData(dest).then(audioBuffer => this.createTrack(channel, audioBuffer));
  }

  createTrackFromUrl(channel: AudioChannel, url: string) 
  {
    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(data => this.context.decodeAudioData(data))
      .then(buffer => this.createTrack(channel, buffer));
  }

  async createStreamedTrackFromUrl(channel: AudioChannel, url: string) 
  {
    const el = document.createElement("audio");
    el.src = url;

    el.load();

    await new Promise((resolve, reject) => 
    {
      el.onloadedmetadata = resolve;
      el.onerror = reject;
    });

    el.ondurationchange = () => console.log(el.duration);

    return new AudioElementTrack(this.context, channel, el);
  }

  createSample(channel: AudioChannel, buffer: AudioBuffer) 
  {
    return new Sample(this.context, channel, buffer);
  }

  async createSampleFromArrayBuffer(channel: AudioChannel, buffer: ArrayBuffer) 
  {
    const dest = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(dest).set(new Uint8Array(buffer));

    return this.context.decodeAudioData(dest).then(buffer => this.createSample(channel, buffer));
  }

  createSampleFromUrl(channel: AudioChannel, url: string) 
  {
    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(data => this.context.decodeAudioData(data))
      .then(buffer => this.createSample(channel, buffer));
  }

  #resumed = new AbortController();

  #channels = new Set<AudioChannel>();

  createChannel(): AudioChannel 
  {
    const channel = new AudioChannel(this);
    this.#channels.add(channel);
    return channel;
  }

  #setupContextAutostart() 
  {
    document.addEventListener("keydown", this.#resumeContext.bind(this), {
      signal: this.#resumed.signal,
    });
    document.addEventListener("mousedown", this.#resumeContext.bind(this), {
      signal: this.#resumed.signal,
    });
  }

  #resumeContext() 
  {
    if (this.context.state === "running")
      return;

    this.context.resume();
    this.#resumed.abort();
  }

  #gain: GainNode;

  get destination() 
  {
    return this.#gain;
  }

  get masterVolume(): number 
  {
    return this.#gain.gain.value;
  }

  set masterVolume(value: number) 
  {
    this.#gain.gain.value = value;
  }
}
