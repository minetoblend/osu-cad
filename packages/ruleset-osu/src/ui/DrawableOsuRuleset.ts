import type { Playfield } from "@osucad/core";
import { DrawableRuleset } from "@osucad/core";

import { OsuPlayfield } from "./OsuPlayfield";
import { OsuPlayfieldAdjustmentContainer } from "./OsuPlayfieldAdjustmentContainer";
import { OsuInputManager } from "./OsuInputManager";
import { OsuRuleset } from "../OsuRuleset";
import type { PassThroughInputManager } from "@osucad/framework";
import { OsuAutoPlayController } from "../gameplay/OsuAutoPlayController";
import { KeyVisualizer } from "../gameplay/KeyVisualizer";

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

    this.keybindingInputManager.useParentInput = false;

    this.playfieldContainer.add(new OsuAutoPlayController(this.playfield, this.keybindingInputManager));

    this.keybindingInputManager.add(new KeyVisualizer());
  }
}
