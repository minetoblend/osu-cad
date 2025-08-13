import { ISkinSource, rulesets } from "@osucad/core";
import { Editor, EditorMultiplayerClient } from "@osucad/editor";
import { dependencyLoader, Game, provide, ScreenStack } from "@osucad/framework";
import { OsuRuleset } from "@osucad/ruleset-osu";
import { SkinManager } from "./SkinManager";

export class OsucadGame extends Game
{
  #screenStack!: ScreenStack;

  @provide(ISkinSource)
  @provide(SkinManager)
  readonly skinManager = new SkinManager();

  readonly client = new EditorMultiplayerClient();

  @dependencyLoader()
  #load()
  {
    rulesets.register(new OsuRuleset());

    this.addRange([
      this.#screenStack = new ScreenStack(),
      this.skinManager,
      this.client,
    ]);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.#screenStack.push(new Editor({ runtime: this.client.runtime }));
  }
}
