import { IResourcesProvider } from "@osucad/core";
import { ISkinSource, rulesets } from "@osucad/core";
import { asyncDependencyLoader, AudioManager, Game, provide, provideSelf, resolved, ScreenStack } from "@osucad/framework";
import { OsuRuleset } from "@osucad/ruleset-osu";
import { SkinManager } from "./SkinManager";
import { UIScaleContainer } from "./UIScaleContainer";
import { EditorLoader } from "./EditorLoader";
import { PerformanceOverlay } from "./PerformanceOverlay";

@provideSelf(IResourcesProvider)
export class OsucadGame extends Game implements IResourcesProvider
{
  #screenStack!: ScreenStack;

  @resolved(AudioManager)
  public accessor audioManager!: AudioManager

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
      new PerformanceOverlay(),
    ]);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.#screenStack.push(new EditorLoader());
  }
}
