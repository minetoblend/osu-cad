import { type ComposeToolInfo, HitObjectComposer, HitObjectSelection } from "@osucad/editor";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { asyncDependencyLoader, DependencyContainer, provide, resolved } from "@osucad/framework";
import type { OsuHitObject } from "../hitObjects";
import { PlayfieldGrid } from "./PlayfieldGrid";
import { HitCircleTool } from "./tools/circle/HitCircleTool";
import { SelectTool } from "./tools/select/SelectTool";
import { SliderTool } from "./tools/slider/SliderTool";
import { SnapManager } from "./SnapManager";
import { OsuSelectionBlueprintContainer } from "./tools/select/OsuSelectionBlueprintContainer";

export class OsuHitObjectComposer extends HitObjectComposer
{
  @provide()
  public readonly snapManager = new SnapManager();

  public constructor()
  {
    super();
  }

  public getTools(): ComposeToolInfo[]
  {
    return [
      SelectTool,
      HitCircleTool,
      SliderTool,
    ];
  }

  public selectionContainer!: OsuSelectionBlueprintContainer;

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer
  {
    return this.#dependencies = new DependencyContainer(super.createChildDependencies(parentDependencies));
  }

  @asyncDependencyLoader()
  async #load()
  {
    this.addInternal(this.snapManager);

    this.rulesetContainer.addRange([
      this.drawableRuleset.createPlayfieldAdjustmentContainer().with({
        depth: Number.MAX_VALUE,
        child: new PlayfieldGrid(),
      }),
    ]);

    this.addInternal(
        this.drawableRuleset.createPlayfieldAdjustmentContainer().with({
          child: this.selectionContainer = new OsuSelectionBlueprintContainer(this.#selection),
          depth: 1,
        }),
    );

    this.#dependencies.provide(OsuSelectionBlueprintContainer, this.selectionContainer);
  }

  @resolved(HitObjectSelection)
  accessor #selection!: HitObjectSelection<OsuHitObject>;

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.activeTool.bindValueChanged(tool =>
    {
      if (!(tool.value === SelectTool))
      {
        this.selectionContainer.hide();
        this.#selection.clear();
      }
      else
      {
        this.selectionContainer.show();
      }
    }, true);
  }
}
