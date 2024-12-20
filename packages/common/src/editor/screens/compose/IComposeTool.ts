import type { Texture } from 'pixi.js';
import type { DrawableComposeTool } from './DrawableComposeTool';

export interface IComposeTool {
  readonly title: string;
  readonly icon: Texture;
  createDrawableTool(): DrawableComposeTool;
  children?: IComposeTool[];
}
