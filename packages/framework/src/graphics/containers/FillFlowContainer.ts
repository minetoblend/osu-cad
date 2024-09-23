import type { EasingFunction } from '../transforms';
import type { ContainerOptions } from './Container';
import { type IVec2, Vec2 } from '../../math';
import { definitelyBigger } from '../../utils/definitelyBigger';
import { Anchor, Axes, axesToString, type Drawable } from '../drawables';
import { FillMode } from '../drawables/FillMode';
import { FlowContainer } from './FlowContainer';

export interface FillFlowContainerOptions<T extends Drawable = Drawable> extends ContainerOptions<T> {
  direction?: FillDirection;
  spacing?: IVec2;
  maxSize?: IVec2;
  layoutDuration?: number;
  layoutEasing?: EasingFunction;
}

export class FillFlowContainer<T extends Drawable = Drawable> extends FlowContainer<T> {
  constructor(options: FillFlowContainerOptions<T> = {}) {
    super();

    this.with(options);
  }

  #direction = FillDirection.Full;

  get direction(): FillDirection {
    return this.#direction;
  }

  set direction(direction: FillDirection) {
    if (direction === this.#direction)
      return;

    this.#direction = direction;
    this.invalidateLayout();
  }

  #spacing = new Vec2();

  get spacing(): Vec2 {
    return this.#spacing;
  }

  set spacing(spacing: IVec2) {
    if (this.#spacing.equals(spacing))
      return;

    this.#spacing = Vec2.from(spacing);
    this.invalidateLayout();
  }

  #spacingFactor(drawable: Drawable): Vec2 {
    const result = drawable.relativeOriginPosition;

    if (drawable.anchor & Anchor.x2) {
      result.x = 1 - result.x;
    }

    if (drawable.anchor & Anchor.y2) {
      result.y = 1 - result.y;
    }

    return result;
  }

  override computeLayoutPositions(): Vec2[] {
    const max = this.maximumSize;

    if (max.x === 0 && max.y === 0) {
      const s = this.childSize;

      max.x = this.autoSizeAxes & Axes.X ? Infinity : s.x;
      max.y = this.autoSizeAxes & Axes.Y ? Infinity : s.y;
    }

    const children = this.flowingChildren;
    if (children.length === 0)
      return [];

    const layoutPositions: Vec2[] = Array.from({ length: children.length });

    const rowIndices = new Int32Array(children.length);

    const rowOffsetsToMiddle = [0];

    let rowHeight = 0;
    let rowBeginOffset = 0;
    const current = Vec2.zero();

    let size = Vec2.zero();

    function toAxes(direction: FillDirection): Axes {
      switch (direction) {
        case FillDirection.Full:
          return Axes.Both;

        case FillDirection.Horizontal:
          return Axes.X;

        case FillDirection.Vertical:
          return Axes.Y;

        default:
          throw new Error('Unknown FillDirection');
      }
    }

    for (let i = 0; i < children.length; ++i) {
      let c = children[i];

      if (
        (c.relativeSizeAxes & this.autoSizeAxes & toAxes(this.direction)) !== 0
        && (c.fillMode !== FillMode.Fit
          || c.relativeSizeAxes !== Axes.Both
          || c.size.x > this.relativeChildSize.x
          || c.size.y > this.relativeChildSize.y
          || this.autoSizeAxes === Axes.Both)
      ) {
        throw new Error(
          'Drawables inside a fill flow container may not have a relative size axis that the fill flow container is filling in and auto sizing for. '
          + `The fill flow container is set to flow in the ${
            this.direction
          } direction and autosize in {AutoSizeAxes} axes and the child is set to relative size in ${axesToString(
            c.relativeSizeAxes,
          )} axes.`,
        );
      }

      if (i === 0) {
        size = c.boundingBox.size;
        rowBeginOffset = this.#spacingFactor(c).x * size.x;
      }

      const rowWidth = rowBeginOffset + current.x + (1 - this.#spacingFactor(c).x) * size.x;

      if (
        this.#direction !== FillDirection.Horizontal
        && (definitelyBigger(rowWidth, max.x) || this.#direction === FillDirection.Vertical || this.forceNewRow(c))
      ) {
        current.x = 0;
        current.y += rowHeight;

        layoutPositions[i] = current.clone();

        rowOffsetsToMiddle.push(0);
        rowBeginOffset = this.#spacingFactor(c).x * size.x;

        rowHeight = 0;
      }
      else {
        layoutPositions[i] = current.clone();

        rowOffsetsToMiddle[rowOffsetsToMiddle.length - 1] = rowBeginOffset - rowWidth / 2;
      }

      rowIndices[i] = rowOffsetsToMiddle.length - 1;
      let stride = Vec2.zero();

      if (i < children.length - 1) {
        stride = new Vec2(1).sub(this.#spacingFactor(c)).mul(size);

        c = children[i + 1];
        size = c.boundingBox.size;

        stride = stride.add(this.#spacingFactor(c).mul(size));
      }

      stride = stride.add(this.#spacing);

      if (stride.y > rowHeight)
        rowHeight = stride.y;
      current.x += stride.x;
    }

    const height = layoutPositions[children.length - 1].y;

    const ourRelativeAnchor = children[0].relativeAnchorPosition.clone();

    for (let i = 0; i < children.length; i++) {
      const c = children[i];

      switch (this.direction) {
        case FillDirection.Vertical:
          if (c.relativeAnchorPosition.y !== ourRelativeAnchor.y) {
            throw new Error(
              `All drawables in a FillFlowContainer must use the same RelativeAnchorPosition for the given FillDirection(${this.direction}) (${ourRelativeAnchor.y} !== ${c.relativeAnchorPosition.y}). Consider using multiple instances of FillFlowContainer if this is intentional.`,
            );
          }

          break;

        case FillDirection.Horizontal:
          if (c.relativeAnchorPosition.x !== ourRelativeAnchor.x) {
            throw new Error(
              `All drawables in a FillFlowContainer must use the same RelativeAnchorPosition for the given FillDirection(${this.direction}) (${ourRelativeAnchor.x} !== ${c.relativeAnchorPosition.x}). Consider using multiple instances of FillFlowContainer if this is intentional.`,
            );
          }

          break;

        default:
          if (!c.relativeAnchorPosition.equals(ourRelativeAnchor)) {
            throw new Error(
              `All drawables in a FillFlowContainer must use the same RelativeAnchorPosition for the given FillDirection(${this.direction}) (${ourRelativeAnchor} !== ${c.relativeAnchorPosition}). Consider using multiple instances of FillFlowContainer if this is intentional.`,
            );
          }

          break;
      }

      const layoutPosition = layoutPositions[i];
      if (c.anchor & Anchor.x1)
        layoutPosition.x += rowOffsetsToMiddle[rowIndices[i]];
      else if (c.anchor & Anchor.x2)
        layoutPosition.x = -layoutPosition.x;

      if (c.anchor & Anchor.y1)
        layoutPosition.y -= height / 2;
      else if (c.anchor & Anchor.y2)
        layoutPosition.y = -layoutPosition.y;

      layoutPositions[i] = layoutPosition;
    }

    return layoutPositions;
  }

  protected forceNewRow(drawable: Drawable): boolean {
    return false;
  }
}

export enum FillDirection {
  Full,
  Horizontal,
  Vertical,
}
