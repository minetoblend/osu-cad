import type {
  DependencyContainer,
  ReadonlyDependencyContainer,
} from 'osucad-framework';
import type { DrawableRuleset } from '../../../rulesets/DrawableRuleset';
import type { IComposeTool } from './IComposeTool';
import {
  Anchor,
  Axes,
  Bindable,
  CompositeDrawable,
  Container,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { Ruleset } from '../../../rulesets/Ruleset';
import { ComposeToolbar } from './ComposeToolbar';
import { ComposeToolContainer } from './ComposeToolContainer';
import { HitObjectComposerDependencies } from './HitObjectComposerDependencies';
import { HitObjectSelectionManager } from './HitObjectSelectionManager';
import { ToolbarButton } from './ToolbarButton';

export abstract class HitObjectComposer extends CompositeDrawable {
  #tools!: IComposeTool[];

  activeTool!: Bindable<IComposeTool>;

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  @resolved(Ruleset)
  protected ruleset!: Ruleset;

  @resolved(IBeatmap)
  protected beatmap!: IBeatmap;

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.Both;

    const selectionManager = new HitObjectSelectionManager();

    this.addInternal(selectionManager);

    this.#dependencies.provide(selectionManager);

    this.#dependencies.provide(new HitObjectComposerDependencies(
      this.#tools = this.getTools(),
      this.activeTool = new Bindable(this.#tools[0]),
    ));

    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: {
          vertical: 6,
          horizontal: ToolbarButton.SIZE + 40,
        },
        children: [
          new Container({
            relativeSizeAxes: Axes.Both,
            padding: { bottom: 30 },
            child: this.#drawableRuleset = this.ruleset.createDrawableEditorRulesetWith(this.beatmap),
          }),
          this.settingsLayer = new Container({
            relativeSizeAxes: Axes.X,
            height: 24,
            padding: { bottom: 3 },
            anchor: Anchor.BottomLeft,
            origin: Anchor.BottomLeft,
          }),
        ],
      }),
      this.leftSidebar = new Container({
        relativeSizeAxes: Axes.Both,
        padding: 10,
        child: new ComposeToolbar(this.#tools),
      }),
    );

    this.drawableRuleset.playfield.addAll(
      this.backgroundLayer = new Container({
        relativeSizeAxes: Axes.Both,
        depth: 1,
      }),
      this.overlayLayer = new Container({
        relativeSizeAxes: Axes.Both,
        depth: -1,
      }),
    );

    this.overlayLayer.add(this.#toolContainer = new ComposeToolContainer());

    this.#toolContainer.toolActivated.addListener((tool) => {
      this.settingsLayer.clear();
      this.settingsLayer.add(tool.createSettings());
    });
  }

  #toolContainer!: ComposeToolContainer;

  #drawableRuleset!: DrawableRuleset;

  backgroundLayer!: Container;

  overlayLayer!: Container;

  settingsLayer!: Container;

  leftSidebar!: Container;

  protected override loadComplete() {
    super.loadComplete();
  }

  protected get drawableRuleset() {
    return this.#drawableRuleset;
  }

  protected abstract getTools(): IComposeTool[];
}
