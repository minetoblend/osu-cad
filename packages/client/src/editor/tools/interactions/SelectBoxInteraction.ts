import {ToolInteraction} from "./ToolInteraction.ts";
import {SelectTool} from "../SelectTool.ts";
import {Graphics, Rectangle} from "pixi.js";
import {Slider, Spinner, Vec2} from "@osucad/common";

export class SelectBoxInteraction extends ToolInteraction {
  private selectBox = new Graphics();

  constructor(tool: SelectTool, private startPosition: Vec2) {
    super(tool);
    this.addChild(this.selectBox);
  }

  onTick() {
    const min = Vec2.min(this.startPosition, this.mousePos);
    const end = Vec2.max(this.startPosition, this.mousePos);
    const rect = new Rectangle(min.x, min.y, end.x - min.x, end.y - min.y);
    this.selectBox.clear();

    if (rect.width === 0 || rect.height === 0) return;

    this.selectBox.roundRect(min.x, min.y, end.x - min.x, end.y - min.y, 2)
      .stroke(0xffffff);

    this.selection.selectAll(
      this.visibleHitObjects.filter(it => {
        if (it instanceof Spinner) return false;

        if (rect.contains(it.position.x, it.position.y))
          return true;

        return it instanceof Slider && rect.contains(it.position.x + it.path.endPosition.x, it.position.y + it.path.endPosition.y);
      }),
    );
  }

  onMouseUp() {
    this.complete();
  }


}