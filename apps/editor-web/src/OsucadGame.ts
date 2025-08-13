import { Beatmap, ISkinSource, rulesets } from "@osucad/core";
import { Editor } from "@osucad/editor";
import { ScreenStack } from "@osucad/framework";
import { dependencyLoader, Game } from "@osucad/framework";
import { OsuRuleset } from "@osucad/ruleset-osu";
import { MultiplayerTest } from "./MultiplayerTest";

export class OsucadGame extends Game
{
  #screenStack!: ScreenStack;

  @dependencyLoader()
  #load()
  {
    this.add(this.#screenStack = new ScreenStack());
  }

  protected override loadComplete()
  {
    super.loadComplete();

    rulesets.register(new OsuRuleset());

    this.#screenStack.push(new MultiplayerTest());
  }
}
