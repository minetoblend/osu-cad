import type { AudioChannel } from "../AudioChannel";

export class SampleFactory
{
  constructor(
    data: AudioBuffer,
    readonly name: string,
    channel: AudioChannel,
  )
  {
    this.#data = data;
    this.#channel = channel;
  }

  readonly #data: AudioBuffer;

  readonly #channel: AudioChannel;

  createSample()
  {
    return this.#channel.createSample(this.#data);
  }
}
