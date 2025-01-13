import type { Bindable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { DrawableComposeTool } from './DrawableComposeTool';
import type { IComposeTool } from './IComposeTool';
import type { Operator } from './operators/Operator';
import { Action, Axes, BindableBoolean, CompositeDrawable, Container, FillDirection, FillFlowContainer, resolved, Vec2 } from 'osucad-framework';
import { UpdateHandler } from '../../../crdt/UpdateHandler';
import { EditorBeatmap } from '../../EditorBeatmap';
import { EditorClock } from '../../EditorClock';
import { DrawableToolModifier } from './DrawableToolModifier';
import { HitObjectComposerDependencies } from './HitObjectComposerDependencies';
import { OperatorBox } from './operators/OperatorBox';

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

    this.internalChildren = [
      this.#toolContainer,
      this.#operatorContainer,
    ];
  }

  readonly modifierContainer = new FillFlowContainer<DrawableToolModifier>({
    direction: FillDirection.Horizontal,
    autoSizeAxes: Axes.Both,
    spacing: new Vec2(10),
    padding: { vertical: 4 },
  });

  readonly #toolContainer = new Container({
    relativeSizeAxes: Axes.Both,
  });

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const { activeTool } = dependencies.resolve(HitObjectComposerDependencies);
    this.activeTool = activeTool.getBoundCopy();
  }

  protected override loadComplete() {
    super.loadComplete();

    this.activeTool.bindValueChanged((tool) => {
      this.#activeDrawableTool?.expire();

      this.#toolContainer.add(this.#activeDrawableTool = tool.value.createDrawableTool());
      this.#onToolActivated(this.#activeDrawableTool);
    }, true);

    this.updateHandler.commandApplied.addListener(this.#commandApplied, this);
  }

  #onToolActivated(tool: DrawableComposeTool) {
    this.toolActivated.emit(tool);

    this.#updateModifiers(tool);

    tool.modifiersChanged.addListener(() => this.#updateModifiers(tool));
  }

  #updateModifiers(tool: DrawableComposeTool) {
    this.modifierContainer.children = [
      ...tool.getModifiers().map(it => new DrawableToolModifier(it)),
    ];
  }

  #activeOperator?: Operator;

  #activeOperatorBox?: OperatorBox;

  #operatorContainer = new Container({
    relativeSizeAxes: Axes.Both,
  });

  protected readonly operatorExpanded = new BindableBoolean(false);

  readonly #rememberedPropertyCache = new Map<any, any[]>();

  beginOperator(operator: Operator, alreadyApplied = false) {
    this.#endOperator();

    this.loadComponent(operator);

    if (this.#rememberedPropertyCache.has(operator.constructor)) {
      const values = this.#rememberedPropertyCache.get(operator.constructor)!;
      const properties = operator.properties;

      for (let i = 0; i < properties.length; i++) {
        if (values.length === 0)
          break;

        if (properties[i].remember)
          properties[i].value = values.shift();
      }
    }

    this.#activeOperator = operator;
    this.#operatorContainer.add(
      this.#activeOperatorBox = new OperatorBox(operator),
    );
    if (operator.prominent)
      this.#activeOperatorBox!.expanded.value = true;
    else
      this.#activeOperatorBox!.expanded.bindTo(this.operatorExpanded);

    this.#lastRunHadChanges = alreadyApplied;

    operator.propertyChanged.addListener(this.#operatorInvalidated, this);

    if (!alreadyApplied)
      this.#applyOperator(operator);
  }

  get activeOperator() {
    return this.#activeOperator ?? null;
  }

  completeOperator(operator: Operator) {
    if (this.activeOperator !== operator)
      return;

    this.#endOperator();
  }

  cancelOperator(operator: Operator) {
    if (this.#activeOperator !== operator)
      return;

    if (this.#lastRunHadChanges)
      this.updateHandler.undo();

    this.#endOperator();
  }

  #endOperator() {
    if (this.#activeOperator) {
      this.#activeOperator.propertyChanged.removeListener(this.#operatorInvalidated, this);
      this.#activeOperator.ended.emit();
    }

    this.#activeOperator = undefined;
    this.#activeOperatorBox?.expire();
  }

  #operatorInvalidated(operator: Operator) {
    this.scheduler.addOnce(this.#applyOperator, this);
  }

  @resolved(UpdateHandler)
  updateHandler!: UpdateHandler;

  @resolved(EditorBeatmap)
  editorBeatmap!: EditorBeatmap;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #lastRunHadChanges = false;

  #operatorIsRunning = false;

  #applyOperator(operator = this.#activeOperator) {
    if (!operator)
      return;

    try {
      this.#operatorIsRunning = true;

      if (this.#lastRunHadChanges)
        this.updateHandler.undo();

      operator.apply({
        beatmap: this.editorBeatmap,
        clock: this.editorClock,
      });

      const properties = operator.properties;

      const rememberedValues: any[] = [];
      for (let i = 0; i < properties.length; i++) {
        if (properties[i].remember)
          rememberedValues.push(properties[i].value);
      }

      if (rememberedValues.length > 0)
        this.#rememberedPropertyCache.set(operator.constructor, rememberedValues);

      this.#lastRunHadChanges = this.updateHandler.commit();
    }
    finally {
      this.#operatorIsRunning = false;
    }
  }

  #commandApplied() {
    if (this.#operatorIsRunning)
      return;

    this.#endOperator();
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.updateHandler.commandApplied.removeListener(this.#commandApplied, this);
  }
}
