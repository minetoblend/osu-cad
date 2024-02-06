import {model, Schema} from "mongoose";
import {
  AudioPreferences,
  BeatmapPreferences,
  BehaviorPreferences,
  GraphicsPreferences,
  GridPreferences,
  Preferences,
  ViewportPreferences
} from "@osucad/common";


export const BehaviorPreferencesSchema = new Schema<BehaviorPreferences>({
  rightClickBehavior: {
    type: String,
    enum: ['contextMenu', 'delete'],
    default: 'contextMenu',
  }
}, {_id: false})

export const AudioPreferencesSchema = new Schema<AudioPreferences>({
  masterVolume: {
    type: Number,
    min: 0,
    max: 100,
    default: 65,
  },
  musicVolume: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  hitsoundVolume: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  uiVolume: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  hitsoundPanning: {
    type: Number,
    min: 0,
    max: 200,
    default: 100,
  }
}, {_id: false})

export const GraphicsPreferencesSchema = new Schema<GraphicsPreferences>({
  renderer: {
    type: String,
    enum: ['auto', 'webgl', 'webgpu'],
    default: 'webgl',
  },
  highDpiMode: {
    type: Boolean,
    default: true,
  },
  resolution: {
    type: Number,
    min: 0.0,
    max: 1.0,
    default: 1.0,
  },
  antialiasing: {
    type: Boolean,
    default: false,
  }
}, {_id: false})

export const GridPreferencesSchema = new Schema<GridPreferences>({
  enabled: {
    type: Boolean,
    default: true,
  },
  color: {
    type: String,
    default: '#FFFFFF',
  },
  opacity: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  }
}, {_id: false})

export const ViewportPreferencesSchema = new Schema<ViewportPreferences>({
  playfieldScale: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  snakingSliders: {
    type: Boolean,
    default: true,
  },
  hitAnimations: {
    type: Boolean,
    default: false,
  },
  backgroundDim: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  backgroundBlur: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  grid: {
    type: GridPreferencesSchema,
    default: {},
  },
}, {_id: false})

export const BeatmapPreferencesSchema = new Schema<BeatmapPreferences>({
  defaultSettings: {
    hpDrainRate: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },
    circleSize: {
      type: Number,
      min: 0,
      max: 10,
      default: 4,
    },
    overallDifficulty: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.5,
    },
    approachRate: {
      type: Number,
      min: 0,
      max: 10,
      default: 9,
    },
  }
}, {_id: false})

export type UserPreferences = Preferences & {
  userId: number;
}

export const PreferencesSchema = new Schema<UserPreferences>({
  userId: {
    type: Number,
    unique: true,
    required: true,
  },
  behavior: {
    type: BehaviorPreferencesSchema,
    default: {}
  },
  audio: {
    type: AudioPreferencesSchema,
    default: {}
  },
  graphics: {
    type: GraphicsPreferencesSchema,
    default: {}
  },
  viewport: {
    type: ViewportPreferencesSchema,
    default: {}
  },
  beatmap: {
    type: BeatmapPreferencesSchema,
    default: {}
  },
})

export const PreferencesModel = model<UserPreferences>('Preferences', PreferencesSchema)