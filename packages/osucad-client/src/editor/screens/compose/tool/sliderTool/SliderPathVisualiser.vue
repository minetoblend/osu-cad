<script setup lang="ts">
import {PathPoint, PathType, Slider, Vec2} from "@osucad/common";
import SliderPathHandle from "./SliderPathHandle.vue";
import SliderPathLine from "./SliderPathLine.vue";
import {useViewport} from "../../tools/composables/mouseEvents";
import {FederatedPointerEvent, IHitArea} from "pixi.js";
import {computed} from "vue";
import {useKeyModifier} from "@vueuse/core";

const props = defineProps<{
  slider: Slider;
  showNewPoint?: boolean;
}>();

const emit = defineEmits<{
  (
      name: "mousedown:handle",
      info: { index: number; evt: FederatedPointerEvent },
  ): void;
  (name: "insert", info: { index: number; position: Vec2 }): void;
}>();

const { mousePos } = useViewport()!;

function isHovering(point: PathPoint) {
  return (
      Vec2.distanceSq(
          Vec2.add(point.position, props.slider.position),
          mousePos.value,
      ) < 100
  );
}

const ctrlDown = useKeyModifier("Control");

const newPoint = computed(() => {
  let last = props.slider.controlPoints.first;

  let closest: { position: Vec2; index: number } | undefined = undefined;
  let closestDistance: number = Infinity;

  for (let i = 1; i < props.slider.controlPoints.length; i++) {
    const current = props.slider.controlPoints.get(i)!;

    const A = last.position;
    const B = current.position;
    const P = Vec2.sub(mousePos.value, props.slider.position);
    const AB = Vec2.sub(B, A);
    const AP = Vec2.sub(P, A);

    const lengthSquaredAB = Vec2.lengthSquared(AB);

    let t = (AP.x * AB.x + AP.y * AB.y) / lengthSquaredAB;
    t = Math.max(0, Math.min(1, t));

    let position = Vec2.add(A, Vec2.scale(AB, t));

    const distance = Vec2.distance(position, P);

    if (distance < 20) {
      if (distance < closestDistance) {
        closest = {
          position,
          index: i,
        };
        closestDistance = distance;
      }
    }
    last = current;
  }

  return closest;
});

const createPointHitarea: IHitArea = {
  contains() {
    return !!(newPoint.value && ctrlDown.value);
  },
};

function onPointerDown(evt: FederatedPointerEvent) {
  console.log(newPoint.value);
  if (evt.ctrlKey && newPoint.value) {
    emit("insert", {
      index: newPoint.value.index,
      position: newPoint.value.position,
    });
  }
}
</script>

<template>
  <pixi-container :position="slider.position">
    <SliderPathLine :slider="slider"/>
    <pixi-container>
      <SliderPathHandle
          v-if="showNewPoint && newPoint && ctrlDown"
          :type="null"
          :position="newPoint.position"
          :hit-area="createPointHitarea"
          @pointerdown="onPointerDown"
      />
    </pixi-container>
    <SliderPathHandle
        v-for="(controlPoint, index) in slider.controlPoints.controlPoints"
        :key="index"
        :position="controlPoint.position"
        :type="controlPoint.type"
        :hovered="isHovering(controlPoint)"
        @pointerdown="emit('mousedown:handle', { index, evt: $event })"
    />
  </pixi-container>
</template>
