import type { Texture } from 'pixi.js';
import type { ComposeTool } from './ComposeTool';
import type { DrawableComposeTool } from './DrawableComposeTool';
import { SliderPresetTool } from './SliderPresetTool';
import { DrawableWaveSliderTool } from './DrawableWaveSliderTool';

export class WaveSliderTool extends SliderPresetTool {
  get icon(): Texture {
    return useAsset('icon:slidershape-wave@2x');
  }

  isSameTool(): boolean {
    // always recreate tool
    return false;
  }

  isActive(tool: ComposeTool): boolean {
    return tool instanceof WaveSliderTool;
  }

  createDrawableTool(): DrawableComposeTool {
    return new DrawableWaveSliderTool();
  }
}