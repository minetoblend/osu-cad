import { BindableNumber } from "../bindables/BindableNumber";
import { AudioDestination } from "./AudioDestination";
import type { IAudioSource } from "./IAudioSource";

export class AudioMixer extends AudioDestination implements IAudioSource
{
  constructor(name: string, readonly context: AudioContext)
  {
    super(name);

    this.#gain = context.createGain();

    this.volume.bindValueChanged(volume => this.#gain.gain.value = volume.value);
  }

  readonly #gain: GainNode;

  readonly volume = new BindableNumber(1)
    .withMinValue(0)
    .withMaxValue(1);

  get output()
  {
    return this.#gain;
  }

  protected override get input(): AudioNode
  {
    return this.#gain;
  }

  public override dispose()
  {
    this.volume.unbindAll();

    super.dispose();
  }
}
