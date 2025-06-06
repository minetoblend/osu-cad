import { BindableNumber } from "../bindables/BindableNumber";
import { AudioDestination } from "./AudioDestination";
import { AudioMixer } from "./AudioMixer";
import type { IAudioDestination } from "./IAudioDestination";
import { Sample } from "./Sample";

export class AudioManager extends AudioDestination implements IAudioDestination
{
  readonly context: AudioContext;

  readonly volume = new BindableNumber(1)
    .withMinValue(0)
    .withMaxValue(1);

  readonly sampleMixer: AudioMixer;

  readonly trackMixer: AudioMixer;

  readonly #gain: GainNode;

  constructor()
  {
    super("Audio Manager");

    this.context = new AudioContext({ latencyHint: "interactive" });

    this.#gain = this.context.createGain();
    this.#gain.connect(this.context.destination);

    this.sampleMixer = this.createMixer("Samples Mixer");
    this.trackMixer = this.createMixer("Track Mixer");

    this.volume.bindValueChanged(volume => this.#gain.gain.value = volume.value);
  }

  protected override get input(): AudioNode
  {
    return this.#gain;
  }

  public createMixer(name: string = "Mixer")
  {
    const mixer = new AudioMixer(name, this.context);

    this.connect(mixer);

    return mixer;
  }

  public createSample(buffer: AudioBuffer, mixer?: AudioMixer, name: string = "Sample")
  {
    const sample = new Sample(name, buffer, this.context);

    mixer?.connect(sample);

    return sample;
  }

  public override dispose()
  {
    super.dispose();

    this.#gain.disconnect();

    this.volume.unbindAll();

    void this.context.close();
  }
}
