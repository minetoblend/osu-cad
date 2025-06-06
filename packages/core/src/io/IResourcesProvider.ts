import type { AudioManager } from "@osucad/framework";
import { injectionToken } from "@osucad/framework";

export interface IResourcesProvider
{
  readonly audioManager: AudioManager
}

export const IResourcesProvider = injectionToken<IResourcesProvider>("IResourcesProvider");
