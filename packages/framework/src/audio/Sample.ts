import { Action } from "../bindables/Action";
import { BindableNumber } from "../bindables/BindableNumber";
import { AudioDestination } from "./AudioDestination";
import type { IAudioDestination } from "./IAudioDestination";
import type { IAudioSource } from "./IAudioSource";
import { SampleChannel } from "./SampleChannel";

export class Sample extends AudioDestination<SampleChannel> implements IAudioSource
{
  readonly onPlay = new Action<Sample>();

  readonly volume = new BindableNumber(1)
    .withMinValue(0)
    .withMaxValue(1);

  readonly balance = new BindableNumber(0)
    .withMinValue(-1)
    .withMaxValue(1);

  readonly rate = new BindableNumber(1);

  public looping = false;

  get output(): AudioNode
  {
    return this.#gain;
  }

  protected get input(): AudioNode
  {
    return this.#pan;
  }

  destination?: IAudioDestination | undefined;

  readonly #gain: GainNode;
  readonly #pan: StereoPannerNode;

  constructor(
    name: string,
    readonly buffer: AudioBuffer,
    readonly context: AudioContext,
  )
  {
    super(name);

    this.#gain = context.createGain();
    this.#pan = context.createStereoPanner();

    this.#pan.connect(this.#gain);

    this.volume.bindValueChanged(volume => this.#gain.gain.value = volume.value);
    this.balance.bindValueChanged(balance => this.#pan.pan.value = balance.value);
  }

  play()
  {
    const channel = this.createChannel();
    channel.play();
    return channel;
  }

  protected createChannel()
  {
    const channel = new SampleChannel(this);
    channel.onPlay.addListener(this.#onChannelPlay, this);

    return channel;
  }

  #onChannelPlay(channel: SampleChannel)
  {
    this.connect(channel);
    this.onPlay.emit(this);
  }
}
