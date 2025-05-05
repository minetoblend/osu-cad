import type { Playfield } from "@osucad/core";
import { DrawableRuleset } from "@osucad/core";

import { OsuPlayfield } from "./OsuPlayfield";
import { OsuPlayfieldAdjustmentContainer } from "./OsuPlayfieldAdjustmentContainer";

export class DrawableOsuRuleset extends DrawableRuleset 
{
  constructor() 
  {
    super();
  }

  protected override createPlayfield(): Playfield 
  {
    return new OsuPlayfield();
  }

  protected override createPlayfieldAdjustmentContainer() 
  {
    return new OsuPlayfieldAdjustmentContainer();
  }
}
