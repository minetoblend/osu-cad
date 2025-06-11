import { Action } from "../bindables/Action";
import type { Bindable } from "../bindables/Bindable";
import { AudioComponent } from "./AudioComponent";
import type { IAudioDestination } from "./IAudioDestination";
import type { IAudioSource } from "./IAudioSource";
import type { Sample } from "./Sample";

export class SampleChannel extends AudioComponent implements IAudioSource
{
  readonly onPlay = new Action<SampleChannel>();

  get looping()
  {
    return this.#source.loop;
  }

  set looping(value: boolean)
  {
    this.#source.loop = value;
  }

  readonly #rate: Bindable<number>;

  readonly #source: AudioBufferSourceNode;

  #playing = false;

  #played = false;

  constructor(readonly sample: Sample)
  {
    super(`SampleChannel (${sample.name})`);

    const { buffer, context, looping } = this.sample;

    this.#source = new AudioBufferSourceNode(context, {
      buffer,
      loop: looping,
    });

    this.#source.onended = this.#onEnded.bind(this);

    this.#rate = sample.rate.getBoundCopy();
    this.#rate.bindValueChanged(rate => this.#source.playbackRate.value = rate.value, true);
  }

  public play()
  {
    if (this.isDisposed)
      throw new Error("Cannot not play disposed sample");

    if (this.#played)
      return false;

    this.#source.start();
    this.onPlay.emit(this);

    this.#playing = true;
    this.#played = true;

    return true;
  }

  public stop()
  {
    this.#source.stop();
    this.#playing = false;
  }

  get playing()
  {
    return this.#playing;
  }

  override get isAlive()
  {
    return super.isAlive && this.playing;
  }

  get output(): AudioNode
  {
    return this.#source;
  }

  destination?: IAudioDestination;

  #onEnded()
  {
    this.#playing = false;
  }

  public override dispose()
  {
    this.stop();

    this.#rate.unbindAll();

    super.dispose();
  }
}
