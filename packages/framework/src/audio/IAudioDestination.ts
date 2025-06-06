import type { IAudioComponent } from "./IAudioComponent";
import type { IAudioSource } from "./IAudioSource";

export interface IAudioDestination extends IAudioComponent
{
  connect(source: IAudioSource): void

  disconnect(source: IAudioSource): boolean;
}
