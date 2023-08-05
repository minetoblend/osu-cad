<script setup lang="ts">
import {useEditor} from "@/editor/createEditor";
import {useViewport} from "../../tools/composables/mouseEvents";
import {Circle, Vec2} from "@osucad/common";
import {Ref, inject, onUnmounted, watch, computed} from "vue";
import {globalHitArea} from "../../tools/hitArea";
import {FederatedMouseEvent} from "pixi.js";
import {createSnapManager} from "../snapping";
import {computedWithControl} from "@vueuse/shared";
import {onKeyDown} from "@vueuse/core";

const { mousePos } = useViewport()!;
const { container, clock, hitObjects } = useEditor()!;

const snapManager = createSnapManager();

const snappedMousePos = computedWithControl(mousePos, () => {
  const offset = snapManager.snap([mousePos.value]);

  return offset ? Vec2.add(mousePos.value, offset) : mousePos.value;
});

let previewCircle: Circle = new Circle(container.runtime);
previewCircle.isGhost = true;

watch(
    () => clock.currentTimeAnimated,
    (time) => (previewCircle.startTime = time),
    { immediate: true },
);

watch(
    snappedMousePos,
    (pos) => {
      previewCircle.position = pos;
    },
    {
      immediate: true,
    },
);

hitObjects.insert(previewCircle);

onUnmounted(() => {
  hitObjects.remove(previewCircle);
});

function onMouseDown(evt: FederatedMouseEvent) {
  const hitObjectsAtTime = hitObjects.items.filter(
      (o) => Math.abs(o.startTime - clock.currentTime) < 0.5 && !o.isGhost,
  );

  hitObjectsAtTime.forEach((o) => {
    hitObjects.remove(o);
  });

  const circle = new Circle(container.runtime);
  circle.position = snappedMousePos.value;
  circle.startTime = clock.currentTime;
  hitObjects.insert(circle);

  hitObjects.remove(previewCircle);

  const stop = watch(snappedMousePos, (mousePos) => {
    circle.position = mousePos;
  });

  addEventListener(
      "mouseup",
      () => {
        stop();
        hitObjects.insert(previewCircle);
      },
      { once: true },
  );
}

onKeyDown("q", () => {
  previewCircle.newCombo = !previewCircle.newCombo;
});

</script>

<template>
  <pixi-container
      :hit-area="globalHitArea"
      @mousedown.left="onMouseDown"
  ></pixi-container>
</template>
