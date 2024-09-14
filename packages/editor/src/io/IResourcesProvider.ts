import type { AudioManager } from 'osucad-framework';
import type { Renderer } from 'pixi.js';

export interface IResourcesProvider {
  readonly renderer: Renderer;
  readonly audioManager: AudioManager;
}

// eslint-disable-next-line ts/no-redeclare
export const IResourcesProvider = Symbol('IResourcesProvider');
