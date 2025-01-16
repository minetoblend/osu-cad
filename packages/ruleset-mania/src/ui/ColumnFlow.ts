import type { Drawable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { StageDefinition } from '../beatmaps/StageDefinition';
import { ISkinSource } from '@osucad/core';
import { Axes, CompositeDrawable, Container, FillDirection, FillFlowContainer, MarginPadding } from '@osucad/framework';
import { LegacyManiaSkinConfigurationLookups } from '../skinning/LegacyManiaSkinConfigurationLookups';
import { ManiaSkinConfigurationLookup } from '../skinning/ManiaSkinConfigurationLookup';
import { Column } from './Column';
import { Stage } from './Stage';

export class ColumnFlow<TContent extends Drawable> extends CompositeDrawable {
  readonly content: TContent[];

  readonly #columns: FillFlowContainer<Container<TContent>>;
  readonly #stageDefinition: StageDefinition;

  constructor(stageDefinition: StageDefinition) {
    super();

    this.#stageDefinition = stageDefinition;
    this.content = [];

    this.autoSizeAxes = Axes.X;
    this.masking = true;

    this.internalChild = this.#columns = new FillFlowContainer({
      relativeSizeAxes: Axes.Y,
      autoSizeAxes: Axes.X,
      direction: FillDirection.Horizontal,
    });

    for (let i = 0; i < stageDefinition.columns; i++)
      this.#columns.add(new Container<TContent>({ relativeSizeAxes: Axes.Y }));
  }

  #currentSkin!: ISkinSource;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.#currentSkin = dependencies.resolve(ISkinSource);

    this.#currentSkin.sourceChanged.addListener(this.#onSkinChanged, this);
    this.#onSkinChanged();
  }

  #onSkinChanged() {
    for (let i = 0; i < this.#stageDefinition.columns; i++) {
      if (i > 0) {
        const spacing = this.#currentSkin.getConfig(new ManiaSkinConfigurationLookup<number>(LegacyManiaSkinConfigurationLookups.ColumnSpacing, i - 1)) ?? Stage.COLUMN_SPACING;

        this.#columns.children[i].margin = new MarginPadding({ left: spacing });
      }

      const width = this.#currentSkin.getConfig(new ManiaSkinConfigurationLookup<number>(LegacyManiaSkinConfigurationLookups.ColumnWidth, i));

      const isSpecialColumn = this.#stageDefinition.isSpecialColumn(i);

      this.#columns.children[i].width = width ?? (isSpecialColumn ? Column.SPECIAL_COLUMN_WIDTH : Column.COLUMN_WIDTH);
    }
  }

  setContentForColumn(columnIndex: number, content: TContent) {
    this.content[columnIndex] = this.#columns.children[columnIndex].child = content;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.#currentSkin.sourceChanged.removeListener(this.#onSkinChanged, this);
  }
}
