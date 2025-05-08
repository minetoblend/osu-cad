import type { Playfield } from "@osucad/core";
import { DrawableRuleset } from "@osucad/core";

import { OsuPlayfield } from "./OsuPlayfield";
import { OsuPlayfieldAdjustmentContainer } from "./OsuPlayfieldAdjustmentContainer";
import { OsuAutoGameplayProcessor } from "../gameplay/OsuAutoGameplayProcessor";

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

  protected override createGameplayProcessor(playfield: Playfield)
  {
    return new OsuAutoGameplayProcessor(playfield as OsuPlayfield);
  }
}
