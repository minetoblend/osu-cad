import type { Texture } from 'pixi.js';
import { getIcon } from '../../../../OsucadIcons';
import type { ComposeTool } from './ComposeTool';
import type { DrawableComposeTool } from './DrawableComposeTool';
import { SliderPresetTool } from './SliderPresetTool';
import { DrawableZWaveSliderTool } from './DrawableZWaveSliderTool';

export class ZWaveSliderTool extends SliderPresetTool {
  get icon(): Texture {
    return getIcon('slidershape-zwave@2x');
  }

  isSameTool(): boolean {
    // always recreate tool
    return false;
  }

  isActive(tool: ComposeTool): boolean {
    return tool instanceof ZWaveSliderTool;
  }

  createDrawableTool(): DrawableComposeTool {
    return new DrawableZWaveSliderTool();
  }
}
