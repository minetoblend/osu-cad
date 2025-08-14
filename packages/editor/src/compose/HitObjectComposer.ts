import { DrawableRuleset, Playfield } from "@osucad/core";
import { Ruleset } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { DependencyContainer } from "@osucad/framework";
import { Container } from "@osucad/framework";
import { asyncDependencyLoader, Axes, CompositeDrawable, dependencyLoader, provide, resolved } from "@osucad/framework";
import { EditorBeatmap } from "../runtime/dds/EditorBeatmap";
import type { ComposeToolInfo } from "./tools";
import { ComposeToolbar } from "./tools";
import { ActiveToolBindable } from "./tools/ActiveToolBindable";
import { ComposeToolContainer } from "./tools/ComposeToolContainer";

export abstract class HitObjectComposer extends CompositeDrawable
{
  protected constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #toolbar!: ComposeToolbar;

  @provide()
  readonly activeTool = new ActiveToolBindable(null!);

  @resolved(Ruleset)
  accessor ruleset!: Ruleset;

  @resolved(EditorBeatmap)
  accessor beatmap!: EditorBeatmap;

  get hasTimeline()
  {
    return true;
  }

  drawableRuleset!: DrawableRuleset;
  rulesetContainer!: Container;

  #dependencies!: DependencyContainer;

  override createChildDependencies(parentDependencies: ReadonlyDependencyContainer)
  {
    return this.#dependencies = new DependencyContainer(parentDependencies);
  }

  @asyncDependencyLoader()
  async #load()
  {
    this.drawableRuleset = await this.ruleset.createDrawableRuleset({ cursor: false, useInput: false });

    this.#dependencies.provide(DrawableRuleset, this.drawableRuleset);
    this.#dependencies.provide(Playfield, this.drawableRuleset.playfield);

    this.internalChildren = [
      new ComposeToolContainer(),
      this.rulesetContainer = new Container({
        relativeSizeAxes: Axes.Both,
        child: this.drawableRuleset,
      }),
      this.#toolbar = new ComposeToolbar(),
    ];

    const tools = await this.getTools();
    this.activeTool.value = tools[0];

    for (const tool of tools)
      this.#toolbar.addTool(tool);

    for (const hitObject of this.beatmap.hitObjects)
      this.drawableRuleset.addHitObject(hitObject);

    this.beatmap.hitObjects.added.addListener(h =>
    {
      this.drawableRuleset.addHitObject(h);
    });
    this.beatmap.hitObjects.removed.addListener(h =>
    {
      this.drawableRuleset.removeHitObject(h);
    });
  }

  protected override loadComplete()
  {
    super.loadComplete();
  }

  protected abstract getTools(): ComposeToolInfo[] | Promise<ComposeToolInfo[]>;
}
