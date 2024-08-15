import type { Texture } from 'pixi.js';
import { ComposeTool } from './ComposeTool';
import type { DrawableComposeTool } from './DrawableComposeTool';
import { DrawableHitCircleTool } from './DrawableHitCircleTool';

export class HitCircleTool extends ComposeTool {
  get icon(): Texture {
    return useAsset('icon:circle');
  }

  isSameTool(tool: ComposeTool): boolean {
    return tool instanceof HitCircleTool;
  }

  createDrawableTool(): DrawableComposeTool {
    return new DrawableHitCircleTool();
  }
}
