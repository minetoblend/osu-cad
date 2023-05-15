import { onScopeDispose, watch } from "vue";
import { Circle as PixiCircle, Graphics } from "pixi.js";
import { Container } from "pixi.js";
import { defineTool, getToolContext } from "./defineTool";

import circlesvg from "@/assets/icons/circle.svg";
import {
  onViewportMouseDown,
  useViewportMousePos,
  useViewportOverlay,
} from "./composables";
import { Circle } from "@osucad/common";

export const CircleTool = defineTool(
  {
    name: "Circle",
    icon: circlesvg,
  },
  () => {
    const mousePos = useViewportMousePos();

    const { container, hitObjects, clock, users } = getToolContext().editor;

    let previewCircle: Circle = new Circle(container.runtime);
    previewCircle.isGhost = true;

    watch(
      () => clock.currentTime,
      (time) => (previewCircle.startTime = time),
      { immediate: true }
    );

    watch(
      mousePos,
      (mousePos) => {
        previewCircle.position = mousePos;
      },
      { immediate: true }
    );

    hitObjects.insert(previewCircle);

    onViewportMouseDown.left((e, beginDrag) => {
      const hitObjectsAtTime = hitObjects.items.filter(
        (o) => Math.abs(o.startTime - clock.currentTime) < 0.5 && !o.isGhost
      );

      hitObjectsAtTime.forEach((o) => {
        hitObjects.remove(o);
      });

      const circle = new Circle(container.runtime);
      circle.position = mousePos.value;
      circle.startTime = clock.currentTime;
      hitObjects.insert(circle);

      hitObjects.remove(previewCircle);

      beginDrag(
        (e) => {
          circle.position = e.pos;
        },
        () => {
          hitObjects.insert(previewCircle);
        }
      );
    });

    onScopeDispose(() => {
      hitObjects.remove(previewCircle);
    });
  }
);
