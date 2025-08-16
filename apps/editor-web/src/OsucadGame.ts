import { ISkinSource, rulesets } from "@osucad/core";
import { asyncDependencyLoader, Game, provide, ScreenStack } from "@osucad/framework";
import { OsuRuleset } from "@osucad/ruleset-osu";
import { SkinManager } from "./SkinManager";
import { UIScaleContainer } from "./UIScaleContainer";
import { EditorLoader } from "./EditorLoader";
import { PerformanceOverlay } from "./PerformanceOverlay";

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
      new PerformanceOverlay(),
    ]);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.#screenStack.push(new EditorLoader());
  }
}
