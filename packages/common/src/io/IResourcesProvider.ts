import type { AudioManager } from 'osucad-framework';
import type { Renderer } from 'pixi.js';
import type { AudioMixer } from '../audio/AudioMixer';
import type { OsucadConfigManager } from '../config/OsucadConfigManager';
import { injectionToken } from 'osucad-framework';

export interface IResourcesProvider {
  readonly renderer: Renderer;
  readonly audioManager: AudioManager;
  readonly config: OsucadConfigManager;
  readonly mixer: AudioMixer;
}

// eslint-disable-next-line ts/no-redeclare
export const IResourcesProvider = injectionToken<IResourcesProvider>('IResourcesProvider');
