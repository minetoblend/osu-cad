<script setup lang="ts">
import { reactive, ref, watch, watchEffect } from "vue";
import { PathType, Slider, Vec2 } from "@osucad/common";
import { FederatedMouseEvent, Graphics, Rectangle } from "pixi.js";
import SliderPathHandle from "./SliderPathHandle.vue";
import { useViewport } from "../composables/mouseEvents";
import { globalHitArea } from "../hitArea";
import { computed } from "@vue/reactivity";
import { onKeyDown, onKeyPressed, useKeyModifier } from "@vueuse/core";
import { useEditor } from "@/editor/createEditor";
import { DashLine } from "pixi-dashed-line";
import SliderPathLine from "./SliderPathLine.vue";

const props = defineProps<{
  slider: Slider;
}>();

const { hitObjects } = useEditor()!;

const graphics = ref<Graphics>();
const selectedHandles = reactive(new Set<number>());

const { mousePos } = useViewport()!;

const ctrlDown = useKeyModifier("Control");



function getNextPathType(pathType: PathType | null) {
  switch (pathType) {
    case PathType.Bezier:
      return PathType.PerfectCurve;
    case PathType.PerfectCurve:
      return PathType.Linear;
    case PathType.Linear:
      return PathType.Catmull;
    case PathType.Catmull:
      return null;
    default:
      return PathType.Bezier;
  }
}

function onHandleMouseDown(evt: FederatedMouseEvent, index: number) {
  evt.stopPropagation();
  if (evt.button === 0) {
    if (evt.ctrlKey) {

      let nextType = getNextPathType(props.slider.controlPoints[index].type);
      if (index === 0 && nextType === null) nextType = PathType.Bezier;
      props.slider.controlPoints[index].type = nextType;
      props.slider.controlPoints = props.slider.controlPoints;
    } else if (evt.shiftKey) {
      if (selectedHandles.has(index)) selectedHandles.delete(index);
      else selectedHandles.add(index);
      return;
    } else {
      if (!selectedHandles.has(index)) {
        selectedHandles.clear();
        selectedHandles.add(index);
      }
    }
    const startMousPos = mousePos.value;
    const positions = props.slider.controlPoints.map((cp) => cp.position);
    const sliderStartPosition = props.slider.position;
    const stop = watch(
      mousePos,
      (mousePos) => {
        const delta = {
          x: mousePos.x - startMousPos.x,
          y: mousePos.y - startMousPos.y,
        };

        if (selectedHandles.has(0)) {
          for (let i = 0; i < props.slider.controlPoints.length; i++) {
            if (!selectedHandles.has(i)) {
              props.slider.controlPoints[i].position = Vec2.round(
                Vec2.sub(positions[i], delta)
              );
            } else {
              props.slider.controlPoints[i].position = positions[i];
            }
          }
          props.slider.position = Vec2.round(
            Vec2.add(sliderStartPosition, delta)
          );
        } else {
          for (let i = 0; i < props.slider.controlPoints.length; i++) {
            if (selectedHandles.has(i)) {
              props.slider.controlPoints[i].position = Vec2.round(
                Vec2.add(positions[i], delta)
              );
            } else {
              props.slider.controlPoints[i].position = positions[i];
            }
          }
        }

        props.slider.controlPoints = props.slider.controlPoints;
      },
      { immediate: true }
    );
    window.addEventListener("mouseup", stop, { once: true });
  }
}

function onHandleRightDown(evt: FederatedMouseEvent, index: number) {
  evt.preventDefault();

  if (props.slider.controlPoints.length > 2) {
    props.slider.controlPoints.splice(index, 1);
    props.slider.controlPoints = props.slider.controlPoints;
    selectedHandles.clear();
  }
}

const newPointPosition = computed(() => {
  let last = props.slider.controlPoints[0];

  let closest: { position: Vec2; index: number } | undefined = undefined;

  let closestDistance: number = Infinity;

  for (let i = 1; i < props.slider.controlPoints.length; i++) {
    const current = props.slider.controlPoints[i];

    const A = last.position;
    const B = current.position;
    const P = Vec2.sub(mousePos.value, props.slider.position);
    const AB = Vec2.sub(B, A);
    const AP = Vec2.sub(P, A);

    const lengthSquaredAB = Vec2.lengthSquared(AB);

    let t = (AP.x * AB.x + AP.y * AB.y) / lengthSquaredAB;

    let position = Vec2.add(A, Vec2.scale(AB, t));

    const distance = Vec2.distance(position, P);

    if (distance < 20) {
      t = Math.max(0, Math.min(1, t));
      position = Vec2.add(A, Vec2.scale(AB, t));

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

function onGlobalMouseDown(evt: FederatedMouseEvent) {
  if (evt.button !== 0) return;
  if (!newPointPosition.value) return;

  if (evt.ctrlKey) {
    evt.preventDefault();
    evt.stopPropagation();

    const controlPoints = [...props.slider.controlPoints];
    const index = newPointPosition.value.index;

    controlPoints.splice(index, 0, {
      position: newPointPosition.value.position,
      type: null,
    });

    props.slider.controlPoints = controlPoints;

    const stop = watch(mousePos, (mousePos) => {
      controlPoints[index].position = Vec2.round(
        Vec2.sub(mousePos, props.slider.position)
      );

      props.slider.controlPoints = controlPoints;
    });

    window.addEventListener("pointerup", stop, { once: true });
  }
}

onKeyDown("Delete", () => {
  if (selectedHandles.size > 0) {
    if (selectedHandles.size === props.slider.controlPoints.length) {
      hitObjects.remove(props.slider);
    }

    const controlPoints = [...props.slider.controlPoints];

    for (const index of selectedHandles) {
      controlPoints.splice(index, 1);
    }

    const offset = controlPoints[0].position;

    for (const controlPoint of controlPoints) {
      controlPoint.position = Vec2.sub(controlPoint.position, offset);
    }

    props.slider.position = Vec2.add(props.slider.position, offset);

    props.slider.controlPoints = controlPoints;
    selectedHandles.clear();
  }
});
</script>

<template>
  <pixi-container :position="slider.position">
    <SliderPathLine :slider="slider" />
    <pixi-container :hit-area="globalHitArea" @mousedown="onGlobalMouseDown" />
    <SliderPathHandle
      v-for="(controlPoint, index) in slider.controlPoints"
      :key="index"
      :position="controlPoint.position"
      :type="controlPoint.type"
      :selected="selectedHandles.has(index)"
      @mousedown.left="onHandleMouseDown($event, index)"
      @rightdown="onHandleRightDown($event, index)"
    />
  </pixi-container>
</template>
