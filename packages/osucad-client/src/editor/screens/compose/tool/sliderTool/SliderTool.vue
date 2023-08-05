<script setup lang="ts">
import {useEditor} from "@/editor/createEditor";
import {PathType, Slider, Vec2} from "@osucad/common";
import {nn} from "@osucad/unison";
import {computedWithControl} from "@vueuse/shared";
import {shallowRef, watch} from "vue";
import {useViewport} from "../../tools/composables/mouseEvents";
import {globalHitArea} from "../../tools/hitArea";
import {createSnapManager} from "../snapping";
import CirclePlacementPreview from "./CirclePlacementPreview.vue";
import SliderPathVisualiser from "./SliderPathVisualiser.vue";
import {onKeyDown, useKeyModifier} from "@vueuse/core";
import {FederatedMouseEvent, Point} from "pixi.js";

const { mousePos } = useViewport()!;
const { container, clock, hitObjects, timing, selection } = useEditor()!;

const activeSlider = shallowRef<Slider>();

const snapManager = createSnapManager({
  excludeHitObjects: () => [activeSlider.value!],
});

const snappedMousePos = computedWithControl(mousePos, () => {
  const offset = snapManager.snap([mousePos.value]);

  return offset ? Vec2.add(mousePos.value, offset) : mousePos.value;
});

watch(
    snappedMousePos,
    (pos) => {
      if (activeSlider.value && activeSlider.value.controlPoints.length > 1) {
        activeSlider.value.controlPoints.updateLast({
          position: Vec2.round(Vec2.sub(pos, activeSlider.value.position)),
        });

        recalculateSliderLength(activeSlider.value);
      }
    },
    {
      immediate: true,
    },
);

function startPlacingSlider() {
  const s = new Slider(container.runtime);
  s.startTime = clock.currentTime;
  s.position = Vec2.round(snappedMousePos.value);
  s.controlPoints.append({ position: Vec2.zero(), type: PathType.Bezier });
  s.controlPoints.append({ position: Vec2.zero(), type: null });

  const referenceSlider = hitObjects.items.findLast(it => (
      it.startTime <= clock.currentTime &&
      it instanceof Slider
  )) as Slider | undefined;

  if (referenceSlider)
    s.velocityMultiplier = referenceSlider.velocityMultiplier;

  const hitObjectsAtTime = hitObjects.items.filter(
      (o) => Math.abs(o.startTime - clock.currentTime) < 0.5 && !o.isGhost,
  );
  hitObjectsAtTime.forEach((o) => hitObjects.remove(o));

  hitObjects.insert(s);

  activeSlider.value = s;

  selection.select(activeSlider.value);
}

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

function addControlPoint(evt: FederatedMouseEvent) {
  const slider = nn(activeSlider.value);

  const index = getControlPointAtMousepos(slider);
  if (index !== -1) {
    const point = slider.controlPoints.get(index);

    if (point && (evt.ctrlKey || point !== slider.controlPoints.last)) {
      let type = getNextPathType(point.type);
      if (point === slider.controlPoints.first && type === null)
        type = getNextPathType(point.type);

      slider.controlPoints.update(index, { type });

      if (point.id !== slider.controlPoints.last.id)
        return;
    }
  }

  let segmentStart = slider.controlPoints.controlPoints.findLastIndex(
      (controlPoint, index) => controlPoint.type !== null || index === 0,
  );
  // + 1 because we haven't added the next point yet
  const segmentLength = slider.controlPoints.length - segmentStart + 1;
  const semgentType = slider.controlPoints.get(segmentStart)?.type;

  if (segmentLength === 3 && semgentType === PathType.Bezier) {
    slider.controlPoints.update(segmentStart, { type: PathType.PerfectCurve });
  } else if (segmentLength === 4 && semgentType === PathType.PerfectCurve) {
    slider.controlPoints.update(segmentStart, { type: PathType.Bezier });
  }

  slider.controlPoints.append({
    position: Vec2.sub(mousePos.value, slider.position),
    type: null,
  });

  recalculateSliderLength(slider);
}

function getControlPointAtMousepos(slider: Slider) {
  const pos = Vec2.sub(mousePos.value, slider.position);

  const thresholdSq = 5 * 5;

  const index = slider.controlPoints.controlPoints.findIndex(
      (it) => Vec2.distanceSq(pos, it.position) < thresholdSq,
  );
  return index;
}

function onRightDown(evt: FederatedMouseEvent) {
  if (evt.ctrlKey) {
    const slider = nn(activeSlider.value);
    const index = getControlPointAtMousepos(slider);
    if (index !== -1) {
      const point = slider.controlPoints.get(index)!;
      if (
          slider.controlPoints.length > 2 &&
          point &&
          point !== slider.controlPoints.last
      ) {
        slider.controlPoints.remove(point);
      }

      return;
    }
  }
  activeSlider.value = undefined;
}

function recalculateSliderLength(slider: Slider) {
  const { velocity, sliderPath, startTime } = slider;

  const fullDistance =
      sliderPath.cumulativeDistance[sliderPath.cumulativeDistance.length - 1];

  const fullDuration = fullDistance / velocity;
  const snappedEndTime = timing.snapTime(startTime + fullDuration, 4, false);
  const snappedDuration = snappedEndTime - startTime;
  const expectedDistance = snappedDuration * velocity;

  slider.expectedDistance = expectedDistance;
}

onKeyDown("q", () => {
  if (!activeSlider.value) return;
  activeSlider.value.newCombo = !activeSlider.value.newCombo;
});
</script>

<template>
  <CirclePlacementPreview
      v-if="!activeSlider"
      :hit-area="globalHitArea"
      @mousedown.left="startPlacingSlider"
  />
  <pixi-container
      v-else
      :hit-area="globalHitArea"
      @mousedown.left="addControlPoint"
      @rightdown="onRightDown"
      cursor="none"
  >
    <SliderPathVisualiser :slider="activeSlider"/>
  </pixi-container>
</template>
