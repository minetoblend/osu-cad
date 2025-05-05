import type { AudioChannel } from "../AudioChannel";
import { Action } from "../../bindables";

export class SamplePlayback 
{
  constructor(
    readonly source: AudioBufferSourceNode,
    readonly context: AudioContext,
    readonly channel: AudioChannel,
  ) 
  {
    this.startTime = this.context.currentTime;
  }

  readonly startTime: number;

  get currentTime() 
  {
    return this.context.currentTime - this.startTime;
  }

  stop() 
  {
    this.source.stop();
  }

  onEnded = new Action<SamplePlayback>();
}
