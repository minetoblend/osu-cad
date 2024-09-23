import type { IVec2, Vec2 } from '../../math';
import { CompositeDrawable } from '../containers';
import { Axes } from '../drawables';

export abstract class CustomisableSizeCompositeDrawable extends CompositeDrawable {
  #hasCustomWidth: boolean = false;

  override get width(): number {
    return super.width;
  }

  override set width(value: number) {
    super.width = value;
    this.#hasCustomWidth = true;
  }

  #hasCustomHeight = false;

  override get height(): number {
    return super.height;
  }

  override set height(value: number) {
    super.height = value;
    this.#hasCustomHeight = true;
  }

  override get size(): Vec2 {
    return super.size;
  }

  override set size(value: IVec2) {
    this.width = value.x;
    this.height = value.y;
  }

  protected abstract getCurrentDisplaySize(): Vec2;

  protected abstract getFillAspectRatio(): number;

  protected updateSizing() {
    this.fillAspectRatio = this.getFillAspectRatio();

    if (this.relativeSizeAxes === Axes.Both)
      return;

    const frameSize = this.getCurrentDisplaySize();

    if ((this.relativeSizeAxes & Axes.X) === 0 && !this.#hasCustomWidth) {
      super.width = frameSize.x;
    }

    if ((this.relativeSizeAxes & Axes.Y) === 0 && !this.#hasCustomHeight) {
      super.height = frameSize.y;
    }
  }
}
