import type { DependencyContainer, Drawable, List, ReadonlyDependencyContainer } from '@osucad/framework';
import type { DrawableRuleset } from '../../../rulesets/DrawableRuleset';
import type { EditorSafeArea } from '../../EditorSafeArea';
import type { IComposeTool } from './IComposeTool';
import type { Operator } from './operators/Operator';
import { Anchor, Axes, Bindable, CompositeDrawable, Container, provide, resolved } from '@osucad/framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { BorderLayout } from '../../../drawables/BorderLayout';
import { Ruleset } from '../../../rulesets/Ruleset';
import { Playfield } from '../../../rulesets/ui/Playfield';
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

    this.#dependencies.provide(HitObjectSelectionManager, selectionManager);

    this.#dependencies.provide(new HitObjectComposerDependencies(
      this.#tools = this.getTools(),
      this.activeTool = new Bindable(this.#tools[0]),
    ));

    this.addInternal(
      this.borderLayout = new BorderLayout({
        west: this.leftSidebar = new Container({
          relativeSizeAxes: Axes.Y,
          autoSizeAxes: Axes.X,
          child: this.createLeftSidebar(),
        }),
        east: this.rightSidebar = new Container({
          relativeSizeAxes: Axes.Y,
          autoSizeAxes: Axes.X,
          child: this.createRightSidebar(),
        }),
        center: this.createMainContent(),
        south: this.modifierContainer = new Container({
          relativeSizeAxes: Axes.X,
          height: 22,
          children: [],
        }),
      }),
    );

    this.#dependencies.provide(Playfield, this.#drawableRuleset.playfield);

    this.drawableRuleset.playfield.addRange([
      this.backgroundLayer = new Container({
        relativeSizeAxes: Axes.Both,
        depth: 1,
      }),
      this.overlayLayer = new Container({
        relativeSizeAxes: Axes.Both,
        depth: -1,
      }),
    ]);

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
    });

    this.topBar = this.createTopBar();

    this.loadComponents([
      this.topBar,
    ]);
  }

  protected override loadComplete() {
    super.loadComplete();
  }

  applySafeAreaPadding(padding: EditorSafeArea) {
    const { top, bottom, bottomInner, bottomLeft, bottomRight } = padding;

    this.leftSidebar.padding = { bottom: bottom - bottomInner };
    this.rightSidebar.padding = { bottom: bottom - bottomInner };
    this.borderLayout.padding = { top, bottom: bottomInner + 5 };

    this.modifierContainer.padding = {
      left: bottomLeft.x + 15,
      right: bottomRight.x + 15,
    };
  }

  protected createMainContent(): Drawable {
    return this.playfieldContainer = new Container({
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.Center,
      origin: Anchor.Center,
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

  protected borderLayout!: BorderLayout;

  protected createRightSidebar(): Container {
    return new Container();
  }

  protected createTopBar(): Drawable {
    return new Container({
      relativeSizeAxes: Axes.X,
      height: ComposeScreenTimeline.HEIGHT,
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

  topBar!: Drawable;

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
