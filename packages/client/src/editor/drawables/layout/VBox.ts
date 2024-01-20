import {Layout} from "./Layout.ts";
import {Component, LayoutInvalidation} from "../Component.ts";
import {Rect} from "@osucad/common";
import {LayoutContext} from "./LayoutContext.ts";

export class VBox extends Layout {

  private _verticalAlign: AlignType = AlignType.Start;

  private _gap = 0;

  get gap() {
    return this._gap;
  }

  set gap(value: number) {
    if (value === this._gap)
      return;
    this._gap = value;
    this.invalidateLayout(LayoutInvalidation.Self);
  }

  get verticalAlign() {
    return this._verticalAlign;
  }

  set verticalAlign(value: AlignType) {
    if (value === this._verticalAlign)
      return;
    this._verticalAlign = value;
    this.invalidateLayout(LayoutInvalidation.Self);
  }

  override layoutChildren(ctx: LayoutContext, children: Component[]) {
    let maxChildWidth = 0;
    for (const child of children) {
      maxChildWidth = Math.max(maxChildWidth, this.getChildWidth(child)) + child.margin * 2;
    }

    let y = 0;
    for (const child of children) {
      let x = 0;
      let width = child.preferredWidth ?? 0;
      let height = child.preferredHeight ?? 0;

      y += child.margin;

      switch (this.verticalAlign) {
        case AlignType.Start:
          x = child.margin;
          break;
        case AlignType.Center:
          // margin is already added to maxChildHeight so we can just center it
          x = (maxChildWidth - width) / 2;
          break;
        case AlignType.End:
          x = maxChildWidth - width - child.margin;
          break;
        case AlignType.Stretch:
          y = child.margin;
          width = maxChildWidth - child.margin * 2;
      }


      if (child.minWidth !== undefined)
        width = Math.max(width, child.minWidth);
      if (child.maxWidth !== undefined)
        width = Math.min(width, child.maxWidth);

      if (child.minHeight !== undefined)
        height = Math.max(height, child.minHeight);
      if (child.maxHeight !== undefined)
        height = Math.min(height, child.maxHeight);

      child.setBounds(new Rect(x, y, width, height));

      x += width + child.margin + this.gap;
    }
    this.preferredWidth = x - this.gap;
    this.preferredHeight = maxChildWidth;
  }

  getChildWidth(child: Component) {
    let width = 0;
    if (child.preferredWidth !== undefined)
      width = child.preferredWidth;
    if (child.maxWidth !== undefined)
      width = Math.min(width, child.maxWidth);
    if (child.minWidth !== undefined)
      width = Math.max(width, child.minWidth);
    return width;
  }

}

export const enum AlignType {
  Start,
  Center,
  End,
  Stretch,
}