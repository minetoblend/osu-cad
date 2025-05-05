import type { IDisposable } from "../types";
import type { AudioChannel } from "./AudioChannel";
import type { AudioManager } from "./AudioManager";

export abstract class AudioFilter implements IDisposable
{
  abstract createNode(manager: AudioManager): AudioNode;

  channel: AudioChannel | null = null;

  connect(channel: AudioChannel, destination: AudioNode)
  {
    this.#node ??= this.createNode(channel.manager);

    this.#node.disconnect();
    this.#node.connect(destination);
  }

  #node!: AudioNode;

  get input(): AudioNode
  {
    return this.#node;
  }

  dispose(): void
  {
    this.#node?.disconnect();
  }
}
