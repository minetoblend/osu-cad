import type { IDisposable } from "../types";
import type { AudioFilter } from "./AudioFilter";
import type { AudioManager } from "./AudioManager";

export class AudioChannel implements IDisposable 
{
  constructor(readonly manager: AudioManager) 
  {
    this.#output = manager.context.createGain();
    this.#input = manager.context.createGain();

    this.#input.connect(this.#output);
    this.#output.connect(manager.destination);
  }

  createSample(buffer: AudioBuffer) 
  {
    return this.manager.createSample(this, buffer);
  }

  readonly #input: GainNode;
  readonly #output: GainNode;

  get input() 
  {
    return this.#input;
  }

  get output() 
  {
    return this.#output;
  }

  get volume(): number 
  {
    return this.#output.gain.value;
  }

  set volume(value: number) 
  {
    this.#output.gain.value = value;
  }

  #filters: AudioFilter[] = [];

  addFilter(filter: AudioFilter) 
  {
    if (filter.channel === this)
      return;
    if (filter.channel) 
    {
      throw new Error("Filter already connected to another channel");
    }

    filter.connect(this, this.#output);
    filter.channel = this;

    if (this.#filters.length > 0) 
    {
      this.#filters[this.#filters.length - 1].connect(this, filter.input);
    }
    else 
    {
      this.#input.disconnect();
      this.#input.connect(filter.input);
    }

    this.#filters.push(filter);
  }

  removeFilter(filter: AudioFilter): boolean 
  {
    const index = this.#filters.indexOf(filter);

    if (index === -1)
      return false;

    filter.connect(this, this.#output);

    const nextFilter = this.#filters[index + 1];
    const nextDestination = nextFilter?.input ?? this.#output;

    if (index > 0) 
    {
      this.#filters[index - 1].connect(this, nextDestination);
    }
    else 
    {
      this.#input.disconnect();
      this.#input.connect(nextDestination);
    }

    this.#filters.splice(index, 1);

    filter.channel = null;

    return true;
  }

  dispose() 
  {
    this.#filters.forEach(filter => filter.dispose());

    this.#output.disconnect();
  }
}
