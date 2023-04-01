import {defineTool} from "./defineTool";

import selectIcon from "@/assets/icons/select.svg";

import {
    onViewportMouseDown,
    useHoveredHitObjects,
    useSelection,
    useViewportMousePos,
    ViewportMouseEvent,
} from "./composables";
import {Bounds, Graphics} from "pixi.js";
import {Vec2} from "@osucad/common";
import {useViewportOverlay} from "./composables/overlay";

export const SelectTool = defineTool(
  {
    name: "Select",
    icon: selectIcon,
  },
  () => {
    const pos = useViewportMousePos();

    const { hovered } = useHoveredHitObjects(pos);

    const selection = useSelection();

    const selectBox = new Graphics();
    selectBox.visible = false;

    useViewportOverlay(selectBox);

    onViewportMouseDown.left((evt: ViewportMouseEvent, beginDrag) => {
      const hitObject = hovered.value[hovered.value.length - 1];
      if (!hitObject) {
        selection.clear();
        selectBox.visible = true;

        const oldSelection = new Set(selection.value);

        // selectbox
        beginDrag(
          (evt) => {
            const minX = Math.min(evt.pos.x, evt.dragStart!.x);
            const minY = Math.min(evt.pos.y, evt.dragStart!.y);
            const maxX = Math.max(evt.pos.x, evt.dragStart!.x);
            const maxY = Math.max(evt.pos.y, evt.dragStart!.y);

            selectBox.clear();
            selectBox.beginFill(0xffffff, 0.1);
            selectBox.lineStyle(1, 0xffffff, 0.6);
            selectBox.drawRoundedRect(minX, minY, maxX - minX, maxY - minY, 2);
            selectBox.endFill();


          },
          () => {
            selectBox.visible = false;
          }
        );
        return;
      }

      if (evt.ctrlKey) {
        selection.add(hitObject);
      } else if (!selection.isSelected(hitObject)) {
        selection.select(hitObject);
      }

      beginDrag((dragEvent: ViewportMouseEvent) => {
        const hitObjects = selection.selectedHitObjects;

        let bounds = new Bounds();
        hitObjects.forEach((hitObject) => {
          bounds.addPoint(hitObject.position);
        });

        const minX = 0 - bounds.minX;
        const minY = 0 - bounds.minY;
        const maxX = 512 - bounds.maxX;
        const maxY = 384 - bounds.maxY;

        const delta = dragEvent.dragDelta!;

        const x = Math.min(Math.max(delta.x, minX), maxX);
        const y = Math.min(Math.max(delta.y, minY), maxY);

        hitObjects.forEach((hitObject) => {
          hitObject.position = Vec2.add(hitObject.position, { x, y });
        });
      });
    });
  }
);

/*
 */
