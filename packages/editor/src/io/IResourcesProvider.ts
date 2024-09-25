import type { AudioManager } from 'osucad-framework';
import type { Renderer } from 'pixi.js';
import { OsucadConfigManager } from '../config/OsucadConfigManager';
import { EditorMixer } from '../editor/EditorMixer';

export interface IResourcesProvider {
  readonly renderer: Renderer;
  readonly audioManager: AudioManager;
  readonly mixer: EditorMixer;
  readonly config: OsucadConfigManager;
}

// eslint-disable-next-line ts/no-redeclare
export const IResourcesProvider = Symbol('IResourcesProvider');
