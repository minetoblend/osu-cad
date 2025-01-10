import type { Bindable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { DrawableComposeTool } from './DrawableComposeTool';
import type { IComposeTool } from './IComposeTool';
import { Action, Anchor, Axes, CompositeDrawable, Container, FillDirection, FillFlowContainer, Vec2 } from 'osucad-framework';
import { DrawableToolModifier } from './DrawableToolModifier';
import { HitObjectComposerDependencies } from './HitObjectComposerDependencies';

export class ComposeToolContainer extends CompositeDrawable {
  readonly toolActivated = new Action<DrawableComposeTool>();

  activeTool!: Bindable<IComposeTool>;

  #activeDrawableTool?: DrawableComposeTool;

  get activeDrawableTool() {
    return this.#activeDrawableTool!;
  }

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(this.#toolContainer);
  }

  readonly modifierContainer = new FillFlowContainer<DrawableToolModifier>({
    direction: FillDirection.Horizontal,
    autoSizeAxes: Axes.Both,
    spacing: new Vec2(5),
    padding: { vertical: 4, horizontal: 20 },
    anchor: Anchor.BottomLeft,
    origin: Anchor.BottomLeft,
  });

  readonly #toolContainer = new Container({
    relativeSizeAxes: Axes.Both,
  });

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const { activeTool } = dependencies.resolve(HitObjectComposerDependencies);
    this.activeTool = activeTool.getBoundCopy();

    activeTool.bindValueChanged((tool) => {
      this.#activeDrawableTool?.expire();

      this.#toolContainer.add(this.#activeDrawableTool = tool.value.createDrawableTool());
      this.#onToolActivated(this.#activeDrawableTool);
    }, true);
  }

  #onToolActivated(tool: DrawableComposeTool) {
    this.toolActivated.emit(tool);

    this.modifierContainer.clear();
    this.modifierContainer.addAll(
      ...tool.modifiers.map(it => new DrawableToolModifier(it)),
    );
  }
}
