import { Bindable } from "@osucad/framework";
import type { ColorSource } from "pixi.js";
import { Color } from "pixi.js";

export class BeatmapColors 
{
  readonly comboColorsBindable = new Bindable<readonly Color[]>([]);

  get comboColors() 
  {
    return this.comboColorsBindable.value;
  }

  set comboColors(value) 
  {
    this.comboColorsBindable.value = value;
  }

  public addComboColor(color: Color) 
  {
    this.comboColors = [...this.comboColors, color];
  }

  readonly sliderTrackOverrideBindable = new Bindable<Color | null>(null);

  get sliderTrackOverride(): Color | null 
  {
    return this.sliderTrackOverrideBindable.value;
  }

  set sliderTrackOverride(value: ColorSource | null) 
  {
    this.sliderTrackOverrideBindable.value = value ? new Color(value) : null;
  }

  readonly sliderBorderBindable = new Bindable<Color | null>(null);

  get sliderBorder(): Color | null 
  {
    return this.sliderBorderBindable.value;
  }

  set sliderBorder(value: ColorSource | null) 
  {
    this.sliderBorderBindable.value = value ? new Color(value) : null;
  }
}
