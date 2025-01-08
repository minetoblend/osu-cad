import type { DrawableHitObject, HitObject } from '@osucad/common';
import type { Drawable, ReadonlyDependencyContainer, Vec2 } from 'osucad-framework';
import type { ManiaHitObject } from '../objects/ManiaHitObject';
import { ISkinSource, ScrollingPlayfield, SkinnableDrawable } from '@osucad/common';
import { Anchor, Axes, Container, MaskingContainer, provide } from 'osucad-framework';
import { StageDefinition } from '../beatmaps/StageDefinition';
import { BarLine } from '../objects/BarLine';
import { DrawableBarLine } from '../objects/drawables/DrawableBarLine';
import { ManiaSkinComponentLookup } from '../skinning/ManiaSkinComponentLookup';
import { ManiaSkinComponents } from '../skinning/ManiaSkinComponents';
import { Column } from './Column';
import { ColumnFlow } from './ColumnFlow';
import { DefaultStageBackground } from './DefaultStageBackground';
import { HitObjectArea } from './HitObjectArea';
import { ManiaAction } from './ManiaAction';

export class Stage extends ScrollingPlayfield {
  @provide(StageDefinition)
  readonly definition: StageDefinition;

  static readonly COLUMN_SPACING = 1;

  static readonly HIT_TARGET_POSITION = 110;

  public get columns() {
    return this.#columnFlow.content;
  }

  readonly #columnFlow: ColumnFlow<Column>;

  readonly #barLineContainer: Drawable;

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    for (const c of this.columns) {
      if (c.receivePositionalInputAt(screenSpacePosition))
        return true;
    }

    return false;
  }

  readonly #firstColumnIndex: number;

  #currentSkin!: ISkinSource;

  constructor(firstColumnIndex: number, definition: StageDefinition, columnStartAction: ManiaAction) {
    super();

    this.#firstColumnIndex = firstColumnIndex;
    this.definition = definition;

    this.label = 'Stage';

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
    this.relativeSizeAxes = Axes.Y;
    this.autoSizeAxes = Axes.X;

    let columnBackgrounds: Container;
    let topLevelContainer: Container;

    this.internalChildren = [
      new Container({
        anchor: Anchor.TopCenter,
        origin: Anchor.TopCenter,
        relativeSizeAxes: Axes.Y,
        autoSizeAxes: Axes.X,
        children: [
          new SkinnableDrawable(new ManiaSkinComponentLookup(ManiaSkinComponents.StageBackground), _ => new DefaultStageBackground()).with({
            relativeSizeAxes: Axes.Both,
          }),
          columnBackgrounds = new Container({
            label: 'Column backgrounds',
            relativeSizeAxes: Axes.Both,
          }),
          new MaskingContainer({
            label: 'Barlines mask',
            anchor: Anchor.TopCenter,
            origin: Anchor.TopCenter,
            relativeSizeAxes: Axes.Y,
            width: 1336, // Bar lines should only be masked on the vertical axis
            bypassAutoSizeAxes: Axes.Both,
            child: this.#barLineContainer = new HitObjectArea(this.hitObjectContainer, {
              label: 'Bar lines',
              anchor: Anchor.TopCenter,
              origin: Anchor.TopCenter,
              relativeSizeAxes: Axes.Y,
            }),
          }),
          this.#columnFlow = new ColumnFlow<Column>(definition).with({
            relativeSizeAxes: Axes.Y,
          }),
          new SkinnableDrawable(new ManiaSkinComponentLookup(ManiaSkinComponents.StageForeground)).with({
            relativeSizeAxes: Axes.Both,
          }),
          topLevelContainer = new Container({
            relativeSizeAxes: Axes.Both,
          }),
        ],
      }),
    ];

    for (let i = 0; i < this.definition.columns; i++) {
      const isSpecial = definition.isSpecialColumn(i);

      const action = columnStartAction;
      columnStartAction = ManiaAction.getFromKey(columnStartAction.key + 1);
      const column = this.createColumn(firstColumnIndex + i, isSpecial).adjust((c) => {
        c.relativeSizeAxes = Axes.Both;
        c.width = 1;
        c.action.value = action;
      });

      // topLevelContainer.add(new ProxyContainer(column.topLevelContainer));
      // columnBackgrounds.add(column.BackgroundContainer.CreateProxy());
      this.#columnFlow.setContentForColumn(i, column);
      this.addNested(column);
    }
  }

  createColumn(index: number, special: boolean) {
    return new Column(index, special);
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.#currentSkin = dependencies.resolve(ISkinSource);
    this.#currentSkin.sourceChanged.addListener(this.#onSkinChanged, this);
    this.#onSkinChanged();

    this.registerPool(BarLine, DrawableBarLine, 50, 200);
  }

  #onSkinChanged() {
    // TODO: update padding
  }

  override addHitObject(hitObject: HitObject) {
    if (hitObject instanceof BarLine) {
      super.addHitObject(hitObject);

      return;
    }

    this.columns[(hitObject as ManiaHitObject).column - this.#firstColumnIndex].addHitObject(hitObject as ManiaHitObject);
  }

  override removeHitObject(hitObject: HitObject): boolean {
    return this.columns[(hitObject as ManiaHitObject).column - this.#firstColumnIndex].removeHitObject(hitObject as ManiaHitObject);
  }

  override addDrawableHitObject(h: DrawableHitObject) {
    this.columns[(h.hitObject as ManiaHitObject).column - this.#firstColumnIndex].addDrawableHitObject(h);
  }

  override removeDrawableHitObject(h: DrawableHitObject): boolean {
    return this.columns[(h.hitObject as ManiaHitObject).column - this.#firstColumnIndex].removeDrawableHitObject(h);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.#currentSkin.sourceChanged.removeListener(this.#onSkinChanged, this);
  }

  override update() {
    super.update();

    this.#barLineContainer.width = this.#columnFlow.width;
  }
}
