import type { DependencyContainer, Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { DrawableRuleset } from '../../../rulesets/DrawableRuleset';
import type { IComposeTool } from './IComposeTool';
import { Anchor, Axes, Bindable, CompositeDrawable, Container, dependencyLoader, EmptyDrawable, Invalidation, isMobile, LayoutMember, resolved } from 'osucad-framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { MobileEditorControls } from '../../../rulesets/osu/edit/MobileEditorControls';
import { Ruleset } from '../../../rulesets/Ruleset';
import { HitsoundPlayer } from '../../HitsoundPlayer';
import { ComposeScreenTimeline } from './ComposeScreenTimeline';
import { ComposeToolbar } from './ComposeToolbar';
import { ComposeToolContainer } from './ComposeToolContainer';
import { HitObjectComposerDependencies } from './HitObjectComposerDependencies';
import { HitObjectComposerSettingsContainer } from './HitObjectComposerSettingsContainer';
import { HitObjectSelectionManager } from './HitObjectSelectionManager';

export abstract class HitObjectComposer extends CompositeDrawable {
  constructor() {
    super();

    this.addLayout(this.#layoutBacking);
  }

  #tools!: IComposeTool[];

  activeTool!: Bindable<IComposeTool>;

  #dependencies!: DependencyContainer;

  timeline!: ComposeScreenTimeline;

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

    let selectionManager = this.dependencies.resolveOptional(HitObjectSelectionManager);
    if (!selectionManager)
      this.addInternal(selectionManager = new HitObjectSelectionManager());

    this.addInternal(new HitsoundPlayer());

    this.#dependencies.provide(selectionManager);

    this.#dependencies.provide(new HitObjectComposerDependencies(
      this.#tools = this.getTools(),
      this.activeTool = new Bindable(this.#tools[0]),
    ));

    this.addAllInternal(
      this.playfieldContainer = new Container({
        relativeSizeAxes: Axes.Both,
        padding: {
          horizontal: 40,
          top: 90,
          bottom: 6,
        },
        children: [
          new Container({
            relativeSizeAxes: Axes.Both,
            child: this.#drawableRuleset = this.ruleset.createDrawableEditorRulesetWith(this.beatmap),
          }),
          this.settingsContainer = new HitObjectComposerSettingsContainer(),
        ],
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 80 },
        children: [
          this.leftSidebar = this.createLeftSidebar(),
          this.rightSidebar = this.createRightSidebar().with({
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
          }),
          this.topBar = new Container({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            child: this.createTopBar(),
          }),
        ],
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        height: 80,
        child: this.timeline = new ComposeScreenTimeline(),
      }),
    );

    this.leftSidebar.invalidated.addListener(([_, invalidation]) => {
      if (invalidation & Invalidation.DrawSize)
        this.#layoutBacking.invalidate();
    });
    this.rightSidebar.invalidated.addListener(([_, invalidation]) => {
      if (invalidation & Invalidation.DrawSize)
        this.#layoutBacking.invalidate();
    });
    this.topBar.invalidated.addListener(([_, invalidation]) => {
      if (invalidation & Invalidation.DrawSize)
        this.#layoutBacking.invalidate();
    });

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
      if (this.#mobileControlsContainer) {
        this.#mobileControlsContainer.clear();
        this.#mobileControlsContainer.child = new MobileEditorControls(tool.createMobileControls());
      }
    });
  }

  playfieldContainer!: Container;

  #toolContainer!: ComposeToolContainer;

  protected createRightSidebar(): Drawable {
    return new EmptyDrawable();
  }

  protected createTopBar(): Drawable {
    return new EmptyDrawable();
  }

  protected createLeftSidebar(): Drawable {
    return new Container({
      relativeSizeAxes: Axes.Y,
      autoSizeAxes: Axes.X,
      padding: 10,
      child: new ComposeToolbar(this.#tools),
    });
  }

  protected get toolContainer() {
    return this.#toolContainer;
  }

  #drawableRuleset!: DrawableRuleset;

  #mobileControlsContainer?: Container;

  backgroundLayer!: Container;

  overlayLayer!: Container;

  settingsContainer!: Container;

  leftSidebar!: Drawable;

  rightSidebar!: Drawable;

  topBar!: Container;

  protected get drawableRuleset() {
    return this.#drawableRuleset;
  }

  protected abstract getTools(): IComposeTool[];

  #layoutBacking = new LayoutMember(Invalidation.DrawSize);

  override update() {
    super.update();

    if (!this.#layoutBacking.isValid) {
      this.playfieldContainer.padding = {
        left: this.leftSidebar.drawWidth + 40,
        right: this.rightSidebar.drawWidth + 40,
        top: this.topBar.drawHeight + 90,
        bottom: 54,
      };

      this.topBar.padding = {
        left: this.leftSidebar.drawWidth,
        right: this.rightSidebar.drawWidth,
      };
      this.#layoutBacking.validate();
    }
  }
}
