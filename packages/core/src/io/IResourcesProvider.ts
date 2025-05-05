import type { AudioManager } from "@osucad/framework";
import { injectionToken } from "@osucad/framework";
import type { AudioMixer } from "../audio/AudioMixer";

export interface IResourcesProvider
{
  readonly audioManager: AudioManager
  readonly audioMixer: AudioMixer
}

export const IResourcesProvider = injectionToken<IResourcesProvider>("IResourcesProvider");
