import { computed, h, onScopeDispose, watchEffect } from "vue";
import { defineTool, getToolContext } from "./defineTool";

import selectIcon from "@/assets/icons/select.svg";

import {
  onViewportMouseDown,
  useHoveredHitObjects,
  useSelection,
  useViewportMousePos,
  useVisibleHitObjects,
  ViewportMouseEvent,
} from "./composables";
import { Container, Graphics, Rectangle } from "pixi.js";
import { Slider, Vec2 } from "@osucad/common";
import { useViewportOverlay } from "./composables/overlay";
import { createSelectBox } from "./components/selectBox";
import { MoveHitObjectInteraction } from "@/editor/interactions/moveHitObjects";
import { createSliderPathVisualiser } from "./components/sliderPathVisualiser";
import { createPixiApp } from "../renderer";
import SelectToolComponent from "./selectTool/SelectTool.vue";

export const SelectTool = defineTool(
  {
    name: "Select",
    icon: selectIcon,
  },
  () => {
    const root = new Container();
    const app = createPixiApp(SelectToolComponent);

    const instance = app.mount(root)

    onScopeDispose(() => {
      app.unmount();
    })

    useViewportOverlay(root);
    return;

    const mousePos = useViewportMousePos();

    const visibleHitObjects = useVisibleHitObjects();

    const { hovered } = useHoveredHitObjects(mousePos);

    const selection = useSelection();

    const activeSlider = computed(() => {
      if (hovered.value.length === 1 && hovered.value[0] instanceof Slider)
        return hovered.value[0];

      if (selection.value.size === 1) {
        const hitObjects = selection.selectedHitObjects[0];
        if (hitObjects instanceof Slider) return hitObjects;
      }
      return undefined;
    });

    const selectBox = new Graphics();
    selectBox.visible = false;

    const selectOverlay = createSelectBox();

    const sliderPathVisualiser = createSliderPathVisualiser(activeSlider);

    useViewportOverlay(selectOverlay, selectBox, sliderPathVisualiser);

    const ctx = getToolContext();

    onViewportMouseDown.left((evt: ViewportMouseEvent, beginDrag) => {
      let hitObject = hovered.value[0];

      const selectedHitObjects = selection.selectedHitObjects;

      if (
        selectedHitObjects.some((p) => Vec2.distance(p.position, evt.pos) < 28)
      ) {
        hitObject = selectedHitObjects[0];
      }
      if (!hitObject) {
        selectBox.visible = true;
        selectBox.clear();

        if (!evt.ctrlKey) selection.clear();

        const oldSelection = new Set(selectedHitObjects);

        // selectbox
        beginDrag(
          (evt) => {
            const rect = new Rectangle(
              Math.min(evt.pos.x, evt.dragStart!.x),
              Math.min(evt.pos.y, evt.dragStart!.y),
              Math.abs(evt.pos.x - evt.dragStart!.x),
              Math.abs(evt.pos.y - evt.dragStart!.y)
            );

            selectBox.clear();
            selectBox.beginFill(0xffffff, 0.1);
            selectBox.lineStyle(1, 0xffffff, 0.6);
            selectBox.drawRoundedRect(
              rect.x,
              rect.y,
              rect.width,
              rect.height,
              2
            );
            selectBox.endFill();

            const objects = visibleHitObjects.value.filter((p) =>
              rectCircleIntersection(rect, p.position, 28)
            );

            if (evt.ctrlKey) selection.select(...oldSelection, ...objects);
            else selection.select(...objects);
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

      if (selection.value.size > 100) {
        // TODO: Show message about not being able to do drag operations on large selections
        return;
      }

      ctx.toolManager.beginInteraction(MoveHitObjectInteraction);
    });
  }
);

function rectCircleIntersection(rect: Rectangle, circle: Vec2, r: number) {
  const circleDistance = {
    x: Math.abs(circle.x - (rect.x + rect.width / 2)),
    y: Math.abs(circle.y - (rect.y + rect.height / 2)),
  };

  if (circleDistance.x > rect.width / 2 + r) {
    return false;
  }
  if (circleDistance.y > rect.height / 2 + r) {
    return false;
  }

  if (
    circleDistance.x <= rect.width / 2 ||
    circleDistance.y <= rect.height / 2
  ) {
    return true;
  }

  const cornerDistance_sq =
    (circleDistance.x - rect.width / 2) * (circleDistance.x - rect.width / 2) +
    (circleDistance.y - rect.height / 2) * (circleDistance.y - rect.height / 2);

  return cornerDistance_sq <= r * r;
}
