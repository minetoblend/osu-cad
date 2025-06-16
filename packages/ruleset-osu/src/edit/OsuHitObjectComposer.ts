import { HitObjectComposer } from "@osucad/editor";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { PlayfieldGrid } from "./PlayfieldGrid";
import { DrawableOsuRuleset } from "../ui";
import type { DrawableRuleset } from "@osucad/core";

export class OsuHitObjectComposer extends HitObjectComposer
{
  constructor()
  {
    super();
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer)
  {
    await super.loadAsync(dependencies);

    this.layerBelowRuleset.add(new PlayfieldGrid());
  }

  protected override createDrawableRuleset(): DrawableRuleset
  {
    return new DrawableOsuRuleset();
  }
}
