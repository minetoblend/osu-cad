import type { DrawableRulesetOptions, Playfield, PlayfieldOptions } from "@osucad/core";
import { DrawableRuleset } from "@osucad/core";

import { OsuPlayfield } from "./OsuPlayfield";
import { OsuPlayfieldAdjustmentContainer } from "./OsuPlayfieldAdjustmentContainer";
import { OsuInputManager } from "./OsuInputManager";
import { OsuRuleset } from "../OsuRuleset";
import type { PassThroughInputManager } from "@osucad/framework";
import { OsuAutoPlayController } from "../gameplay/OsuAutoPlayController";

export class DrawableOsuRuleset extends DrawableRuleset
{
  constructor(options: DrawableRulesetOptions = {})
  {
    super(options);
  }

  protected override createPlayfield(options: PlayfieldOptions): Playfield
  {
    return new OsuPlayfield(options);
  }

  override createPlayfieldAdjustmentContainer()
  {
    return new OsuPlayfieldAdjustmentContainer();
  }

  protected override createInputManager(): PassThroughInputManager
  {
    return new OsuInputManager(new OsuRuleset());
  }

  protected override loadComplete()
  {
    super.loadComplete();
  }
}
