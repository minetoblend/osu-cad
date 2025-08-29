import { DrawableRuleset, Playfield, Ruleset } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { asyncDependencyLoader, Axes, CompositeDrawable, Container, DependencyContainer, provide, provideSelf, ProxyDrawable, resolved } from "@osucad/framework";
import { EditorBeatmap } from "../runtime/dds/EditorBeatmap";
import type { ComposeToolInfo } from "./tools";
import { ComposeToolbar } from "./tools";
import { ActiveToolBindable } from "./tools/ActiveToolBindable";
import { ComposeToolContainer } from "./tools/ComposeToolContainer";
import { ComposePresenceContainer } from "./tools/ToolPresenceContainer";

@provideSelf()
export abstract class HitObjectComposer extends CompositeDrawable
{
  public constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #toolbar!: ComposeToolbar;

  @provide()
  public readonly activeTool = new ActiveToolBindable(null!);

  @resolved(Ruleset)
  protected accessor ruleset!: Ruleset;

  @resolved(EditorBeatmap)
  protected accessor beatmap!: EditorBeatmap;

  public composeToolContainer!: ComposeToolContainer;

  public get hasTimeline()
  {
    return true;
  }

  public drawableRuleset!: DrawableRuleset;
  public rulesetContainer!: Container;

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer)
  {
    return this.#dependencies = new DependencyContainer(parentDependencies);
  }

  @asyncDependencyLoader()
  async #load()
  {
    this.drawableRuleset = await this.ruleset.createDrawableRuleset({ cursor: false, useInput: false, autoMode: true });

    this.#dependencies.provide(DrawableRuleset, this.drawableRuleset);
    this.#dependencies.provide(Playfield, this.drawableRuleset.playfield);

    this.internalChildren = [
      this.composeToolContainer = new ComposeToolContainer(),
      this.rulesetContainer = new Container({
        relativeSizeAxes: Axes.Both,
        child: this.drawableRuleset,
      }),
      new ProxyDrawable(this.composeToolContainer),
      new ComposePresenceContainer(),
      this.#toolbar = new ComposeToolbar(),
    ];

    const tools = this.tools = await this.getTools();
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

  public tools!: ComposeToolInfo[];

  protected abstract getTools(): ComposeToolInfo[] | Promise<ComposeToolInfo[]>;
}
