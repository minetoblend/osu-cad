import type { DependencyContainer, ReadonlyDependencyContainer } from 'osucad-framework';
import type { DrawableRuleset } from '../../../rulesets/DrawableRuleset';
import type { IComposeTool } from './IComposeTool';
import { Anchor, Axes, Bindable, CompositeDrawable, Container, dependencyLoader, isMobile, resolved } from 'osucad-framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { MobileEditorControls } from '../../../rulesets/osu/edit/MobileEditorControls';
import { Ruleset } from '../../../rulesets/Ruleset';
import { ComposeScreenTimeline } from './ComposeScreenTimeline';
import { ComposeToolbar } from './ComposeToolbar';
import { ComposeToolContainer } from './ComposeToolContainer';
import { EditorButton } from './EditorButton';
import { HitObjectComposerDependencies } from './HitObjectComposerDependencies';
import { HitObjectComposerSettingsContainer } from './HitObjectComposerSettingsContainer';
import { HitObjectSelectionManager } from './HitObjectSelectionManager';

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
        padding:
          isMobile.any
            ? {

                left: EditorButton.SIZE + 40,
                right: EditorButton.SIZE * 3 + 40,
                top: 90,
                bottom: 6,
              }
            : {
                horizontal: EditorButton.SIZE + 40,
                top: 90,
                bottom: 6,
              },
        children: [
          new Container({
            relativeSizeAxes: Axes.Both,
            padding: { bottom: 30 },
            child: this.#drawableRuleset = this.ruleset.createDrawableEditorRulesetWith(this.beatmap),
          }),
          this.settingsContainer = new HitObjectComposerSettingsContainer(),
        ],
      }),
      this.leftSidebar = new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 110, horizontal: 10 },
        child: new ComposeToolbar(this.#tools),
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        height: 80,
        child: new ComposeScreenTimeline(),
      }),
    );

    if (isMobile.any) {
      this.addInternal(
        this.#mobileControlsContainer = new Container({
          padding: 10,
          autoSizeAxes: Axes.Y,
          width: 240,
          anchor: Anchor.BottomRight,
          origin: Anchor.BottomRight,
          child: new MobileEditorControls(),
        }),
      );
    }

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
      this.settingsContainer.clear();
      this.settingsContainer.add(tool.createSettings());

      if (this.#mobileControlsContainer) {
        this.#mobileControlsContainer.clear();
        this.#mobileControlsContainer.child = new MobileEditorControls(tool.createMobileControls());
      }
    });
  }

  #toolContainer!: ComposeToolContainer;

  protected get toolContainer() {
    return this.#toolContainer;
  }

  #drawableRuleset!: DrawableRuleset;

  #mobileControlsContainer?: Container;

  backgroundLayer!: Container;

  overlayLayer!: Container;

  settingsContainer!: Container;

  leftSidebar!: Container;

  protected override loadComplete() {
    super.loadComplete();
  }

  protected get drawableRuleset() {
    return this.#drawableRuleset;
  }

  protected abstract getTools(): IComposeTool[];
}
