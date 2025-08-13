import { ISkinSource, rulesets } from "@osucad/core";
import { asyncDependencyLoader, Game, provide, ScreenStack } from "@osucad/framework";
import { OsuRuleset } from "@osucad/ruleset-osu";
import { SkinManager } from "./SkinManager";
import type { EditorMultiplayerClient } from "@osucad/editor";

export class OsucadGame extends Game
{
  #screenStack!: ScreenStack;

  @provide(ISkinSource)
  @provide(SkinManager)
  readonly skinManager = new SkinManager();

  client!: EditorMultiplayerClient;

  @asyncDependencyLoader()
  async #load()
  {
    rulesets.register(new OsuRuleset());

    const { EditorMultiplayerClient } = await import("@osucad/editor");

    this.client = new EditorMultiplayerClient();

    await Promise.all([
      this.loadComponentAsync(this.client),
      this.loadComponentAsync(this.skinManager),
    ]);

    this.addRange([
      this.#screenStack = new ScreenStack(),
      this.skinManager,
      this.client,
    ]);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    void this.loadEditor();
  }

  async loadEditor()
  {
    const { Editor } = await import("@osucad/editor/editor");

    this.#screenStack.push(new Editor({ runtime: this.client.runtime }));
  }
}
