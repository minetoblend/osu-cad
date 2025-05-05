import { Bindable } from "@osucad/framework"
import { Color } from "pixi.js"

export interface SkinConfigurationFields {
  version: string
  animationFramerate: number

  allowSliderBallTint: boolean
  hitCircleOverlayAboveNumber: boolean
  layeredHitSounds: boolean
  sliderBallFlip: boolean
  spinnerFadePlayfield: boolean
  spinnerFrequencyModulate: boolean
  spinnerNoBlink: boolean

  sliderBall: Color
  sliderBorder: Color
  sliderTrackOverride: Color
  spinnerBackground: Color
  starBreakAdditive: boolean

  hitCirclePrefix: string
  hitCircleOverlap: number
  scorePrefix: string
  scoreOverlap: string
  comboPrefix: string
  comboOverlap: number
}

export type SkinConfigurationLookup = keyof SkinConfigurationFields
export type SkinConfigurationValue<K extends SkinConfigurationLookup> = SkinConfigurationFields[K]

export class SkinConfiguration {
  comboColors: Color[] = []

  private readonly _configValues = new Map<string, Bindable<any>>()

  public get<K extends SkinConfigurationLookup>(lookup: K): SkinConfigurationValue<K> | null {
    return this._configValues.get(lookup)?.value ?? null
  }

  public set<K extends SkinConfigurationLookup>(lookup: K, value: SkinConfigurationValue<K> | null) {
    this.getOriginalBindable(lookup).value = value
  }

  public getBindable<K extends SkinConfigurationLookup>(lookup: K): Bindable<SkinConfigurationValue<K> | null> {
    return this.getOriginalBindable(lookup).getBoundCopy()
  }

  private getOriginalBindable<K extends SkinConfigurationLookup>(lookup: K): Bindable<SkinConfigurationValue<K> | null> {
    let bindable = this._configValues.get(lookup)
    if (!bindable) {
      this._configValues.set(lookup, bindable = new Bindable(null))
    }
    return bindable
  }

  dispose() {
    for (const [, bindable] of this._configValues)
      bindable.unbindAll()

    this._configValues.clear()
  }
}