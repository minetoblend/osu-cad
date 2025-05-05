import type { BlurFilterOptions } from "pixi.js";
import { BackdropBlurFilter } from "pixi-filters";
import { BetterBlurFilterPass } from "./BetterBlurFilterPass";

export class BetterBackdropBlurFilter extends BackdropBlurFilter
{
  constructor(options: BlurFilterOptions = {})
  {
    super({
      antialias: "inherit",
      resolution: devicePixelRatio,
      ...options,
    });

    this.blurXFilter = new BetterBlurFilterPass({ horizontal: true, ...options });
    this.blurYFilter = new BetterBlurFilterPass({ horizontal: false, ...options });
  }

  protected override updatePadding()
  {
    // @ts-expect-error private property
    if (this._repeatEdgePixels)
    {
      this.padding = 0;
    }
    else
    {
      this.padding = Math.max(Math.abs(this.blurXFilter.blur), Math.abs(this.blurYFilter.blur)) * 2;
    }
  }
}
