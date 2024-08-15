import type { Texture } from 'pixi.js';
import type { DrawableComposeTool } from './DrawableComposeTool';

export abstract class ComposeTool {
  abstract get icon(): Texture;

  abstract createDrawableTool(): DrawableComposeTool;

  abstract isSameTool(tool: ComposeTool): boolean;

  isActive(tool: ComposeTool): boolean {
    return this.isSameTool(tool);
  }
}
