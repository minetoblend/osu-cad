import { Beatmap, ISkinSource } from "@osucad/core";
import { Editor } from "@osucad/editor";
import { ScreenStack } from "@osucad/framework";
import { dependencyLoader, Game } from "@osucad/framework";
import { OsuRuleset } from "@osucad/ruleset-osu";

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

    const beatmap = new Beatmap();
    beatmap.beatmapInfo.ruleset = new OsuRuleset();

    this.#screenStack.push(new Editor({ beatmap }));
  }
}
