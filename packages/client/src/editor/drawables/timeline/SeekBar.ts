import {Component} from "@/editor/drawables/Component.ts";
import {Graphics, ObservablePoint} from "pixi.js";

export class SeekBar extends Component {
  background = new Graphics()

  onLoad() {
    this.addChild(this.background)
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    if (this.size.x === 0 || this.size.y === 0) return;

    this.background.clear()
      .roundRect(0, 0, this.size.x, this.size.y, this.size.y / 2)
      .fill({
        color: 0x1A1A20,
      })

  }

}