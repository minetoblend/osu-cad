import type { Texture } from 'pixi.js';
import type { ComposeTool } from './ComposeTool';
import type { DrawableComposeTool } from './DrawableComposeTool';
import { getIcon } from '../../../../OsucadIcons';
import { DrawableWaveSliderTool } from './DrawableWaveSliderTool';
import { SliderPresetTool } from './SliderPresetTool';

export class WaveSliderTool extends SliderPresetTool {
  get icon(): Texture {
    return getIcon('slidershape-wave@2x');
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
