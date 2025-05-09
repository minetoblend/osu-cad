import type { Playfield } from "@osucad/core";
import { DrawableRuleset } from "@osucad/core";

import { OsuPlayfield } from "./OsuPlayfield";
import { OsuPlayfieldAdjustmentContainer } from "./OsuPlayfieldAdjustmentContainer";
import { OsuInputManager } from "./OsuInputManager";
import { OsuRuleset } from "../OsuRuleset";
import type { PassThroughInputManager } from "@osucad/framework";

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

  protected override createInputManager(): PassThroughInputManager
  {
    return new OsuInputManager(new OsuRuleset());
  }
}
