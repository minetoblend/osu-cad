import { DrawableRuleset, Playfield, Ruleset } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, asyncDependencyLoader, Axes, CompositeDrawable, Container, DependencyContainer, provide, provideSelf, ProxyDrawable, resolved } from "@osucad/framework";
import { EditorHistory, EditorRuntime } from "../runtime";
import { EditorBeatmap } from "../runtime/dds/EditorBeatmap";
import type { Interaction } from "./interactions/Interaction";
import type { Operator, OperatorContext } from "./operators";
import { OperatorBox } from "./operators/OperatorBox";
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
      new Container({
        relativeSizeAxes: Axes.Y,
        padding: {
          top: 30,
          left: 10,
          bottom: 10,
        },
        child: this.#toolbar = new ComposeToolbar(),
      }),
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

    this.#history.on("undo", () =>
    {
      if (this.#isApplyingOperation)
        return;

      this.completeActiveOperator();
    });

    this.activeTool.bindValueChanged(() => this.completeActiveOperator());
  }

  public tools!: ComposeToolInfo[];

  protected abstract getTools(): ComposeToolInfo[] | Promise<ComposeToolInfo[]>;

  #activeOperator?: Operator;
  #activeOperatorBox?: OperatorBox;
  #activeInteraction?: Interaction;

  public get activeOperator()
  {
    return this.#activeOperator;
  }

  public beginInteraction(interaction: Interaction)
  {
    this.completeActiveOperator();
    this.completeActiveInteraction();

    this.addInternal( this.#activeInteraction = interaction);
  }

  public completeActiveInteraction()
  {
    this.#activeInteraction?.complete();
    this.#activeInteraction?.expire();
    this.#activeInteraction = undefined;
  }

  public beginOperator<T extends Operator, Args extends unknown[]>(operatorClass: new (context: OperatorContext, ...args: Args) => T, ...args: Readonly<Args>)
  {
    const operator = new operatorClass({
      complete: commit =>
      {
        if (this.#activeOperator !== operator)
          return;

        if (commit)
          this.completeActiveOperator();
        else
          this.cancelActiveOperator();
      },
      invalidate: () =>
      {
        this.scheduler.addOnce(this.#applyOperator, this);
      },
      editorBeatmap: this.beatmap,
    }, ...args);

    if (!operator.isValid)
    {
      operator.dispose();
      return;
    }

    this.completeActiveOperator();
    this.completeActiveInteraction();

    this.#activeOperator = operator;

    this.#applyOperator();

    this.#activeOperatorBox?.expire();
    this.addInternal(
        this.#activeOperatorBox = new OperatorBox(operator).with({
          anchor: Anchor.BottomLeft,
          origin: Anchor.BottomLeft,
          x: 20,
          y: -20,
        }),
    );

    return operator;
  }

  public applyOperator<T extends Operator, Args extends unknown[]>(operatorClass: new (context: OperatorContext, ...args: Args) => T, ...args: Args)
  {
    this.beginOperator(operatorClass, ...args);

    this.completeActiveOperator();
  }

  @resolved(EditorHistory)
  accessor #history!: EditorHistory

  @resolved(EditorRuntime)
  accessor #runtime!: EditorRuntime

  public completeActiveOperator()
  {
    if (!this.#activeOperator)
      return false;

    this.#activeOperator.onComplete();
    this.#activeOperator.dispose();
    this.#activeOperator = undefined;
    this.#activeOperatorBox?.expire();

    this.#history.commit();

    return true;
  }

  public cancelActiveOperator(discardChanges = true)
  {
    if (!this.#activeOperator)
      return false;

    this.#activeOperator.onCancel();
    this.#activeOperator.dispose();
    this.#activeOperator = undefined;
    this.#activeOperatorBox?.expire();

    if (discardChanges)
      this.#history.discardUncommittedChanges();

    return true;
  }

  #isApplyingOperation = false;

  #applyOperator()
  {
    this.#isApplyingOperation = true;

    try
    {
      this.#history.discardUncommittedChanges();

      this.#activeOperator?.apply();
    }
    finally
    {
      this.#isApplyingOperation = false;
    }
  }
}
