import type { ReadonlyDependencyContainer } from "../../di/DependencyContainer";
import type { Drawable } from "../drawables/Drawable";
import type { CompositeDrawableOptions } from "./CompositeDrawable";
import type { GridContainerContent } from "./GridContainerContent";
import { Cached } from "../../caching/Cached";
import { Vec2 } from "../../math/Vec2";
import { clamp } from "../../utils/clamp";
import { Axes } from "../drawables/Axes";
import { Invalidation, InvalidationSource } from "../drawables/Drawable";
import { LayoutMember } from "../drawables/LayoutMember";
import { CompositeDrawable } from "./CompositeDrawable";
import { Container } from "./Container";

const sumOf = (values: number[]) => values.reduce((a, b) => a + b, 0);

export interface GridContainerOptions extends CompositeDrawableOptions
{
  content?: GridContainerContent;
  rowDimensions?: readonly Dimension[];
  columnDimensions?: readonly Dimension[];
}

export class GridContainer extends CompositeDrawable
{
  constructor(options: GridContainerOptions = {})
  {
    super();

    this.addLayout(this.#cellLayout);
    this.addLayout(this.#cellChildLayout);

    this.with(options);
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.#layoutContent();
  }

  #content?: GridContainerContent;

  get content(): GridContainerContent | undefined
  {
    return this.#content;
  }

  set content(value: GridContainerContent)
  {
    this.#content = value;
    this.#onContentChange();
  }

  #onContentChange()
  {
    this.#cellContent.invalidate();
  }

  #rowDimensions: readonly Dimension[] = [];

  get rowDimensions(): readonly Dimension[]
  {
    return this.#rowDimensions;
  }

  set rowDimensions(value: readonly Dimension[])
  {
    if (value === this.#rowDimensions)
      return;

    this.#rowDimensions = value;
    this.#cellLayout.invalidate();
  }

  #columnDimensions: readonly Dimension[] = [];

  get columnDimensions(): readonly Dimension[]
  {
    return this.#columnDimensions;
  }

  set columnDimensions(value: readonly Dimension[])
  {
    if (value === this.#columnDimensions)
      return;

    this.#columnDimensions = value;
    this.#cellLayout.invalidate();
  }

  override update()
  {
    super.update();

    this.#layoutContent();
    this.#layoutCells();
  }

  readonly #cellContent = new Cached();
  readonly #cellLayout = new LayoutMember(Invalidation.DrawSize);
  readonly #cellChildLayout = new LayoutMember(Invalidation.RequiredParentSizeToFit | Invalidation.Presence, InvalidationSource.Child);

  #cells: CellContainer[][] = [];

  get #cellRows()
  {
    return this.#cells.length;
  }

  get #cellColumns()
  {
    return this.#cells[0]?.length ?? 0;
  }

  #layoutContent()
  {
    if (this.#cellContent.isValid)
      return;

    const maxBy = <T>(array: readonly T[], fn: (t: T) => number) => array.reduce((a, b) => fn(a) > fn(b) ? a : b, array[0]);

    const requiredRows = this.content?.length ?? 0;
    const requiredColumns = requiredRows === 0
      ? 0
      : this.content?.length
        ? maxBy(this.content, t => t.length).length
        : 0;

    for (const cell of this.#cells.flat())
      cell.clear(false);

    this.clearInternal();
    this.#cellLayout.invalidate();

    this.#cells = Array.from({ length: requiredRows }, () => Array.from({ length: requiredColumns }));

    for (let r = 0; r < this.#cellRows; r++)
    {
      for (let c = 0; c < this.#cellColumns; c++)
      {
        this.#cells[r][c] = new CellContainer();

        const content = this.content!;

        if (!content[r])
          continue;

        if (c >= content[r].length)
          continue;

        // Allow empty cells
        if (!content[r][c])
          continue;

        this.#cells[r][c].add(content[r][c]!);
        this.#cells[r][c].depth = content[r][c]!.depth;

        this.addInternal(this.#cells[r][c]);
      }
    }

    this.#cellContent.validate();
  }

  #layoutCells()
  {
    if (!this.#cellChildLayout.isValid)
    {
      this.#cellLayout.invalidate();
      this.#cellChildLayout.validate();
    }

    if (this.#cellLayout.isValid)
      return;

    const widths = this.#distribute(this.#columnDimensions, this.drawWidth - this.padding.totalHorizontal, this.#getCellSizesAlongAxis(Axes.X, this.drawWidth - this.padding.totalHorizontal));
    const heights = this.#distribute(this.#rowDimensions, this.drawHeight - this.padding.totalVertical, this.#getCellSizesAlongAxis(Axes.Y, this.drawHeight - this.padding.totalVertical));

    for (let col = 0; col < this.#cellColumns; col++)
    {
      for (let row = 0; row < this.#cellRows; row++)
      {
        this.#cells[row][col].size = new Vec2(widths[col], heights[row]);

        if (col > 0)
          this.#cells[row][col].x = this.#cells[row][col - 1].x + this.#cells[row][col - 1].width;
        if (row > 0)
          this.#cells[row][col].y = this.#cells[row - 1][col].y + this.#cells[row - 1][col].height;
      }
    }

    this.#cellLayout.validate();
  }

  #getCellSizesAlongAxis(axis: Axes, spanLength: number): number[]
  {
    const spanDimensions = axis === Axes.X ? this.columnDimensions : this.rowDimensions;
    const spanCount = axis === Axes.X ? this.#cellColumns : this.#cellRows;

    const sizes: number[] = Array.from({ length: spanCount }, () => 0);

    for (let i = 0; i < spanCount; i++)
    {
      if (i >= spanDimensions.length)
        continue;

      const dimension = spanDimensions[i];

      switch (dimension.mode)
      {
      case GridSizeMode.Distributed:
        break;

      case GridSizeMode.Relative:
        sizes[i] = dimension.size * spanLength;
        break;

      case GridSizeMode.Absolute:
        sizes[i] = dimension.size;
        break;

      case GridSizeMode.AutoSize: {
        let size = 0;
        if (axis === Axes.X)
        {
          for (let r = 0; r < this.#cellRows; r++)
          {
            const cell = this.content![r][i];
            if (!cell || cell.relativeSizeAxes & axis)
              continue;

            size = Math.max(size, this.#getCellWidth(cell));
          }
        }
        else
        {
          for (let c = 0; c < this.#cellColumns; c++)
          {
            const cell = this.content![i][c];
            if (!cell || cell.relativeSizeAxes & axis)
              continue;

            size = Math.max(size, this.#getCellHeight(cell));
          }
        }

        sizes[i] = size;
        break;
      }
      }

      sizes[i] = clamp(sizes[i], dimension.minSize, dimension.maxSize);
    }

    return sizes;
  }

  #shouldConsiderCell(cell?: Drawable): boolean
  {
    return !!cell && cell.isAlive && cell.isPresent;
  }

  #getCellWidth(cell?: Drawable): number
  {
    return this.#shouldConsiderCell(cell) ? cell!.boundingBox.width : 0;
  }

  #getCellHeight(cell?: Drawable): number
  {
    return this.#shouldConsiderCell(cell) ? cell!.boundingBox.height : 0;
  }

  #distribute(dimensions: readonly Dimension[], spanLength: number, cellSizes: number[]): number[]
  {
    const distributedIndices: number[] = Array.from({ length: cellSizes.length }, (_, i) => i).filter(i => i >= dimensions.length || dimensions[i].mode === GridSizeMode.Distributed);

    const distributedDimensions = distributedIndices.map<DimensionEntry>(i => ({
      index: i,
      dimension: i >= dimensions.length ? new Dimension() : dimensions[i],
    }));

    let distributionCount = distributedIndices.length;

    // Non-distributed size
    const requiredSize = sumOf(cellSizes);

    // Distribution size for _each_ distributed cell
    let distributionSize = Math.max(0, spanLength - requiredSize) / distributionCount;

    for (const entry of distributedDimensions.sort((a, b) => a.dimension.range - b.dimension.range))
    {
      // Cells start off at their minimum size, and the total size should not exceed their maximum size
      cellSizes[entry.index] = Math.min(entry.dimension.maxSize, entry.dimension.minSize + distributionSize);

      // If there's no excess, any further distributions are guaranteed to also have no excess, so this becomes a null-op
      // If there is an excess, the excess should be re-distributed among all other n-1 distributed cells
      if (--distributionCount > 0)
        distributionSize += Math.max(0, distributionSize - entry.dimension.range) / distributionCount;
    }

    return cellSizes;
  }
}

class CellContainer extends Container
{
  override onInvalidate(invalidation: Invalidation, source: InvalidationSource): boolean
  {
    let result = super.onInvalidate(invalidation, source);

    if (source === InvalidationSource.Child && (invalidation & (Invalidation.RequiredParentSizeToFit | Invalidation.Presence)) > 0)
    {
      if (this.parent?.invalidate(invalidation, InvalidationSource.Child))
        result = true;
    }

    return result;
  }
}

export class Dimension
{
  constructor(
    readonly mode: GridSizeMode = GridSizeMode.Distributed,
    readonly size: number = 0,
    readonly minSize: number = 0,
    readonly maxSize: number = Number.MAX_VALUE,
  )
  {
  }

  get range()
  {
    return this.maxSize - this.minSize;
  }
}

export enum GridSizeMode
{
  Distributed,
  Relative,
  Absolute,
  AutoSize,
}

export interface DimensionEntry
{
  index: number;
  dimension: Dimension;
}
