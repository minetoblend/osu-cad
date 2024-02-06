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

export type RightClickBehavior = 'contextMenu' | 'delete';

export interface AudioPreferences {
  masterVolume: number;
  musicVolume: number;
  hitsoundVolume: number;
  uiVolume: number;
  hitsoundPanning: number;
}

export interface GraphicsPreferences {
  renderer: 'auto' | 'webgl' | 'webgpu';
  highDpiMode: boolean;
  resolution: number;
  antialiasing: boolean;
}

export interface ViewportPreferences {
  playfieldScale: number;
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