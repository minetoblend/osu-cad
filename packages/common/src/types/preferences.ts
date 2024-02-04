export interface Preferences {
  behavior: BehaviorPreferences;
  audio: AudioPreferences;
  graphics: GraphicsPreferences;
  viewport: ViewportPreferences;
  beatmap: BeatmapPreferences;
}

export interface BehaviorPreferences {
  rightClickBehavior: RightClickBehavior;
}

export const enum RightClickBehavior {
  ContextMenu = 'contextMenu',
  Delete = 'delete',
}

export interface AudioPreferences {
  masterVolume: number;
  musicVolume: number;
  hitsoundVolume: number;
  uiVolume: number;
  hitsoundPanning: number;
}

export interface GraphicsPreferences {
  renderer: RendererSelection;
  highDpiMode: boolean;
  antialiasing: boolean;
}

export const enum RendererSelection {
  Auto = 'auto',
  WebGPU = 'webgpu',
  WebGL = 'webgl',
}

export interface ViewportPreferences {
  snakingSliders: boolean;
  hitAnimations: boolean;
  backgroundDim: number;
  backgroundBlur: number;
  grid: GridPreferences;
}

export interface GridPreferences {
  enabled: boolean;
  color: string;
  opacity: number;
}

export interface BeatmapPreferences {
  defaultSettings: DefaultBeatmapSettings;
}

export interface DefaultBeatmapSettings {
  hpDrainRate: number;
  circleSize: number;
  overallDifficulty: number;
  approachRate: number;
  sliderMultiplier: number;
  sliderTickRate: number;
}