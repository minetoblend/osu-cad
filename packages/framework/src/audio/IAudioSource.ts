import type { IAudioComponent } from "./IAudioComponent";
import type { IAudioDestination } from "./IAudioDestination";

export interface IAudioSource extends IAudioComponent
{
  readonly output: AudioNode

  destination?: IAudioDestination
}
