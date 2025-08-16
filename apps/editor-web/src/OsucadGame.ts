import { ISkinSource, rulesets } from "@osucad/core";
import { asyncDependencyLoader, Game, provide, ScreenStack } from "@osucad/framework";
import { OsuRuleset } from "@osucad/ruleset-osu";
import { SkinManager } from "./SkinManager";
import { UIScaleContainer } from "./UIScaleContainer";
import { MultiplayerClient } from "@osucad/multiplayer-client";
import type { EditorRuntime } from "@osucad/editor";

export class OsucadGame extends Game
{
  #screenStack!: ScreenStack;

  @provide(ISkinSource)
  @provide(SkinManager)
  readonly skinManager = new SkinManager();

  @asyncDependencyLoader()
  async #load()
  {
    rulesets.register(new OsuRuleset());

    await Promise.all([
      this.loadComponentAsync(this.skinManager),
    ]);

    this.addRange([
      new UIScaleContainer({
        child: this.#screenStack = new ScreenStack(),
      }),
      this.skinManager,
    ]);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    void this.loadEditor();
  }

  async loadEditor()
  {
    const { Editor, EditorRuntime } = await import("@osucad/editor");

    const client = new MultiplayerClient();

    const document = await client.load("beatmap", {
      runtimeFactory: async () => new EditorRuntime(),
    });

    this.#screenStack.push(new Editor({ runtime: document.runtime as EditorRuntime }));
  }
}
