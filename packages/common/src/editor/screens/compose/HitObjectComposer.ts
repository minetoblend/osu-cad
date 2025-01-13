import type { DependencyContainer, Drawable, List, ReadonlyDependencyContainer } from 'osucad-framework';
import type { DrawableRuleset } from '../../../rulesets/DrawableRuleset';
import type { IComposeTool } from './IComposeTool';
import type { Operator } from './operators/Operator';
import { Anchor, Axes, Bindable, CompositeDrawable, Container, isMobile, provide, resolved } from 'osucad-framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { BorderLayout } from '../../../drawables/BorderLayout';
import { MobileEditorControls } from '../../../rulesets/osu/edit/MobileEditorControls';
import { Ruleset } from '../../../rulesets/Ruleset';
import { Playfield } from '../../../rulesets/ui/Playfield';
import { HitsoundPlayer } from '../../HitsoundPlayer';
import { ComposeScreenTimeline } from './ComposeScreenTimeline';
import { ComposeToolbar } from './ComposeToolbar';
import { ComposeToolContainer } from './ComposeToolContainer';
import { HitObjectComposerDependencies } from './HitObjectComposerDependencies';
import { HitObjectSelectionManager } from './HitObjectSelectionManager';
import { IHitObjectComposer } from './IHitObjectComposer';

@provide(HitObjectComposer)
@provide(IHitObjectComposer)
export abstract class HitObjectComposer extends CompositeDrawable {
  constructor() {
    super();
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

  protected createSelectionManager(): HitObjectSelectionManager<any> {
    return new HitObjectSelectionManager();
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    let selectionManager = this.dependencies.resolveOptional(HitObjectSelectionManager);
    if (!selectionManager)
      this.addInternal(selectionManager = this.createSelectionManager());

    const hitsoundPlayer = new HitsoundPlayer();
    this.addInternal(hitsoundPlayer);
    this.#dependencies.provide(hitsoundPlayer);

    this.#dependencies.provide(HitObjectSelectionManager, selectionManager);

    this.#dependencies.provide(new HitObjectComposerDependencies(
      this.#tools = this.getTools(),
      this.activeTool = new Bindable(this.#tools[0]),
    ));

    this.addInternal(
      new BorderLayout({
        north: this.createTopBar(),
        west: this.leftSidebar = this.createLeftSidebar(),
        east: this.rightSidebar = this.createRightSidebar(),
        center: this.createMainContent(),
        south: this.modifierContainer = new Container({
          relativeSizeAxes: Axes.X,
          height: 18,
          padding: { horizontal: 155 },
          children: [],
        }),
      }),
    );

    this.#dependencies.provide(Playfield, this.#drawableRuleset.playfield);

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

    this.playfieldContainer.add(this.#toolContainer = new ComposeToolContainer());

    const toolOverlayContainer = new Container({ relativeSizeAxes: Axes.Both });
    this.overlayLayer.add(toolOverlayContainer);

    this.modifierContainer.add(this.#toolContainer.modifierContainer);

    this.addInternal(
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
      }),
    );
    this.#toolContainer.toolActivated.addListener((tool) => {
      toolOverlayContainer.clear();
      toolOverlayContainer.add(tool.playfieldOverlay);

      if (this.#mobileControlsContainer) {
        this.#mobileControlsContainer.clear();
        this.#mobileControlsContainer.child = new MobileEditorControls(tool.createMobileControls());
      }
    });
  }

  protected createMainContent(): Drawable {
    return this.playfieldContainer = new Container({
      relativeSizeAxes: Axes.Both,
      padding: {
        top: 10,
      },
      children: [
        new Container({
          relativeSizeAxes: Axes.Both,
          child: this.#drawableRuleset = this.ruleset.createDrawableEditorRulesetWith(this.beatmap),
        }),
      ],
    });
  }

  modifierContainer!: Container;

  playfieldContainer!: Container;

  #toolContainer!: ComposeToolContainer;

  protected createRightSidebar(): Container {
    return new Container();
  }

  protected createTopBar(): Drawable {
    return new Container({
      relativeSizeAxes: Axes.X,
      height: 80,
      child: this.timeline = new ComposeScreenTimeline(),
    });
  }

  protected createLeftSidebar(): Container {
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

  leftSidebar!: Container;

  rightSidebar!: Container;

  topBar!: Container;

  beginOperator(operator: Operator, alreadyApplied = false) {
    this.#toolContainer.beginOperator(operator, alreadyApplied);
  }

  get activeOperator() {
    return this.#toolContainer.activeOperator;
  }

  completeOperator(operator: Operator) {
    this.#toolContainer.completeOperator(operator);
  }

  cancelOperator(operator: Operator) {
    this.#toolContainer.cancelOperator(operator);
  }

  protected get drawableRuleset() {
    return this.#drawableRuleset;
  }

  override buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking?: boolean): boolean {
    return super.buildNonPositionalInputQueue(queue, false);
  }

  protected abstract getTools(): IComposeTool[];
}
