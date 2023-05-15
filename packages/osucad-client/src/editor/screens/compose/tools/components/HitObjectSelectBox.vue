<template>
  <SelectBox @drag="handleSelectBox" />
</template>

<script setup lang="ts">
import { Rectangle } from "pixi.js";
import SelectBox from "./SelectBox.vue";
import { Ref, inject } from "vue";
import { useEditor } from "@/editor/createEditor";
import { HitObject, Vec2 } from "@osucad/common";

const visibleHitObjects = inject("visibleHitObjects") as Ref<HitObject[]>;
const { selection } = useEditor()!;

const handleSelectBox = (rect: Rectangle) => {
  const objects = visibleHitObjects.value.filter((p) =>
    rectCircleIntersection(rect, p.position, 28)
  );
  selection.select(...objects);
};

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
</script>
