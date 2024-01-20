import {UndoableInteraction} from "./UndoableInteraction.ts";
import {FederatedPointerEvent} from "pixi.js";
import {Slider, updateHitObject} from "@osucad/common";
import {snapSliderLength} from "../snapSliderLength.ts";
import {ComposeTool} from "../ComposeTool.ts";


export class InsertControlPointInteraction extends UndoableInteraction {


  constructor(tool: ComposeTool, private slider: Slider, private index: number) {
    super(tool);
  }

  onDrag(event: FederatedPointerEvent) {
    const slider = this.slider;
    const path = slider.path.controlPoints.map(it => ({ ...it }));
    const pos = event.getLocalPosition(this);
    path[this.index].x = pos.x - slider.position.x;
    path[this.index].y = pos.y - slider.position.y;
    this.commandManager.submit(updateHitObject(slider, {
      path,
    }));

    snapSliderLength(slider, this.editor, this.tool.beatInfo);
  }

  onMouseUp(event: FederatedPointerEvent) {
    if (event.button === 0)
      this.complete();
  }
}