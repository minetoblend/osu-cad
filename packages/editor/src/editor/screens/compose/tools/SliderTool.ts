import type { Texture } from 'pixi.js';
import { ComposeTool } from './ComposeTool';
import { DrawableSliderTool } from './DrawableSliderTool';
import type { DrawableComposeTool } from './DrawableComposeTool';
import { SliderPresetTool } from './SliderPresetTool';

export class SliderTool extends ComposeTool {
  get icon(): Texture {
    return useAsset('icon:slider');
  }

  isSameTool(tool: ComposeTool): boolean {
    return tool instanceof SliderTool;
  }

  isActive(tool: ComposeTool): boolean {
    return this.isSameTool(tool) || tool instanceof SliderPresetTool;
  }

  createDrawableTool(): DrawableComposeTool {
    return new DrawableSliderTool();
  }
}
