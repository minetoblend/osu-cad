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

export function defaultPreferences(): Preferences {
  return {
    behavior: {
      rightClickBehavior: "contextMenu",
    },
    viewport: {
      playfieldScale: 1,
      hitAnimations: false,
      snakingSliders: true,
      grid: {
        enabled: true,
        color: '#ffffff',
        opacity: 50,
      },
      backgroundDim: 50,
      backgroundBlur: 25,
    },
    graphics: {
      antialiasing: true,
      resolution: 1,
      renderer: 'auto',
      highDpiMode: true,
    },
    audio: {
      masterVolume: 65,
      musicVolume: 100,
      hitsoundVolume: 100,
      uiVolume: 50,
      hitsoundPanning: 100,
    },
    beatmap: {
      defaultSettings: {
        approachRate: 9,
        circleSize: 4,
        hpDrainRate: 5,
        overallDifficulty: 8,
        sliderMultiplier: 1.4,
        sliderTickRate: 1,
      }
    },
  }
}