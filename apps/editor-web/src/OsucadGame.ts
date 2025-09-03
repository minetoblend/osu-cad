import { ISkinSource, rulesets } from "@osucad/core";
import { asyncDependencyLoader, Game, provide, ScreenStack } from "@osucad/framework";
import { OsuRuleset } from "@osucad/ruleset-osu";
import { SkinManager } from "./SkinManager";
import { UIScaleContainer } from "./UIScaleContainer";
import { EditorLoader } from "./EditorLoader";
import { PerformanceOverlay } from "./PerformanceOverlay";
import{ initDevtools } from "@pixi/devtools";
import * as pixi from "pixi.js";

export class OsucadGame extends Game
{
  #screenStack!: ScreenStack;

  @provide(ISkinSource)
  @provide(SkinManager)
  public readonly skinManager = new SkinManager();

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
      new PerformanceOverlay().with({ alpha: 0 }),
    ]);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    initDevtools({
      renderer: this.host!.renderer.internalRenderer,
      stage: this.host!.root!.drawNode,
      pixi: pixi,
    });

    this.#screenStack.push(new EditorLoader());
  }
}
