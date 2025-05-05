import type { AudioManager } from "./AudioManager";
import { AudioFilter } from "./AudioFilter";

export interface LowpassFilterOptions 
{
  frequency?: number;
  gain?: number;
  q?: number;
}

export class LowpassFilter extends AudioFilter 
{
  constructor(options: LowpassFilterOptions = {}) 
  {
    super();

    this.#frequency = options.frequency;
    this.#gain = options.gain;
    this.#q = options.q;
  }

  override createNode(manager: AudioManager): AudioNode 
  {
    const node = (this.#node = manager.context.createBiquadFilter());

    if (this.#frequency !== undefined)
      node.frequency.value = this.#frequency;
    if (this.#gain !== undefined)
      node.gain.value = this.#gain;
    if (this.#q !== undefined)
      node.Q.value = this.#q;

    node.type = "lowpass";
    return node;
  }

  #node?: BiquadFilterNode;

  #frequency?: number;
  #gain?: number;
  #q?: number;

  get frequency() 
  {
    if (!this.#node)
      throw new Error("Filter not connected");

    return this.#node!.frequency;
  }

  get gain() 
  {
    if (!this.#node)
      throw new Error("Filter not connected");

    return this.#node!.gain;
  }

  get q() 
  {
    if (!this.#node)
      throw new Error("Filter not connected");

    return this.#node!.Q;
  }

  remove(): boolean 
  {
    if (!this.channel)
      return false;

    return this.channel.removeFilter(this);
  }
}
