<script setup lang="ts">
import {Ref, computed, inject, watch, ref, shallowRef, nextTick} from "vue";
import {useViewport} from "../../tools/composables/mouseEvents";
import {HitObject, PathType, Slider, Vec2} from "@osucad/common";
import {useEditor} from "@/editor/createEditor";
import SliderPathVisualiser from "../sliderTool/SliderPathVisualiser.vue";
import SelectBox from "../../tools/components/SelectBox.vue";
import {
  FederatedMouseEvent,
  FederatedPointerEvent,
  IHitArea,
  Rectangle,
} from "pixi.js";
import {rectCircleIntersection} from "@/utils/rectCircleIntersect";
import TransformBox from "../../tools/TransformBox.vue";
import {assert, nn} from "@osucad/unison";
import {computedWithControl, onKeyDown} from "@vueuse/core";
import {createSnapManager} from "../snapping";
import PixiPieMenu from "@/editor/components/PixiPieMenu.vue";
import {mirrorHitObjects} from "@/editor/actions/mirrorHitObjects";
import {moveHitObjects} from "@/editor/actions/moveHitObjects";
import {rotateHitObjects} from "@/editor/actions/rotateHitObjects";

const { mousePos } = useViewport()!;
const hoveredHitObjects = inject("hoveredHitObjects") as Ref<HitObject[]>;
const visibleHitObjects = inject("visibleHitObjects") as Ref<HitObject[]>;

const { selection, hitObjects, timing, clock } = useEditor()!;

const snapManager = createSnapManager({
  excludeHitObjects: () => selection.selectedHitObjects,
});

const snappedMousePos = computedWithControl(mousePos, () => {
  const offset = snapManager.snap([mousePos.value]);

  return offset ? Vec2.add(mousePos.value, offset) : mousePos.value;
});

const activeSlider = computed<Slider | undefined>(() => {
  const hovered = hoveredHitObjects.value;
  if (
      selection.value.size === 0 &&
      hovered.length > 0 &&
      hovered[hovered.length - 1] instanceof Slider
  )
    return hovered[hovered.length - 1] as Slider;

  if (selection.value.size === 1) {
    const hitObject = selection.selectedHitObjects[0];
    if (hitObject instanceof Slider) return hitObject;
  }
  return undefined;
});

function handleSelectBox(rect: Rectangle) {
  selection.select(
      ...visibleHitObjects.value.filter((p) =>
          rectCircleIntersection(rect, p.position, p.radius),
      ),
  );
}

function onMouseDown(evt: FederatedMouseEvent) {
  const hovered = hoveredHitObjects.value;

  if (hovered.length === 0) {
    if (!evt.ctrlKey) selection.clear();
    return;
  }

  if (evt.button === 2) {
    const target = hovered[hovered.length - 1];
    if (target) {
      hitObjects.remove(target);
      evt.stopPropagation();
      return;
    }
  }

  if (evt.ctrlKey) {
    if (selection.isSelected(hovered[0])) {
      selection.remove(hovered[0]);
    } else {
      selection.add(hovered[0]);
    }
  } else {
    if (!selection.isSelected(hovered[0])) selection.select(hovered[0]);
  }

  evt.preventDefault();
  evt.stopPropagation();

  const positions = new Map<HitObject, Vec2>();
  selection.selectedHitObjects.forEach((hitObject) =>
      positions.set(hitObject, hitObject.position),
  );

  const startPos = mousePos.value;

  const stop = watch(mousePos, (mousePos) => {
    const mouseDelta = Vec2.sub(mousePos, startPos);

    const offset = snapManager.snap(
        [...positions]
            .flatMap(([hitObject, pos]) => {
              if (hitObject instanceof Slider) {
                return [
                  pos,
                  Vec2.add(
                      pos,
                      hitObject.sliderPath.calculatedPath[
                      hitObject.sliderPath.calculatedPath.length - 1
                          ] ?? Vec2.zero(),
                  ),
                ];
              }
              return [pos];
            })
            .map((pos) => Vec2.add(pos, mouseDelta)),
    );

    positions.forEach((pos, hitObject) => {
      pos = Vec2.add(pos, mouseDelta);
      hitObject.position = Vec2.round(offset ? Vec2.add(pos, offset) : pos);
    });
  });

  window.addEventListener("pointerup", stop, { once: true });
}

const hitObjectHitArea: IHitArea = {
  contains(x, y) {
    return hoveredHitObjects.value.length > 0;
  },
};

function getNextPathType(pathType: PathType | null) {
  switch (pathType) {
    case PathType.Bezier:
      return PathType.PerfectCurve;
    case PathType.PerfectCurve:
      return PathType.Linear;
    case PathType.Linear:
      return PathType.Catmull;
    case PathType.Catmull:
      return PathType.BSpline;
    case PathType.BSpline:
      return null;
    default:
      return PathType.Bezier;
  }
}

function onSliderHandleMouseDown(index: number, evt: FederatedPointerEvent) {
  const slider = nn(activeSlider.value);
  const controlPoints = slider.controlPoints;

  evt.stopPropagation();

  if (!selection.isSelected(slider)) {
    selection.select(slider);
  }

  if (evt.button === 2) {
    if (controlPoints.length > 2) controlPoints.remove(index);

    if (index === 0) {
      const first = controlPoints.first;

      [...controlPoints.controlPoints].forEach((point, index) =>
          controlPoints.update(index, {
            position: Vec2.sub(point.position, first.position),
          }),
      );

      slider.position = Vec2.add(slider.position, first.position);
    }

    return;
  }

  if (evt.ctrlKey) {
    // let type = getNextPathType(controlPoints.get(index)!.type);
    // if (index === 0 && type === null)
    //   type = getNextPathType(controlPoints.get(index)!.type);
    // controlPoints.update(index, { type });
    controlPointMenu.value = true;
    controlPointMenuPosition.value = Vec2.add(
        slider.position,
        controlPoints.get(index)!.position,
    );
    controlPointMenuIndex.value = index;
    controlPointMenuObject.value = slider;
    return;
  }

  if (index === 0) {
    const originalPath = [...controlPoints.controlPoints];
    const offset = Vec2.sub(slider.position, mousePos.value);

    const startPosition = mousePos.value;
    const sliderStartPosition = slider.position;

    const stop = watch(snappedMousePos, (mousePos) => {
      const delta = Vec2.sub(mousePos, startPosition);

      slider.position = Vec2.round(Vec2.add(sliderStartPosition, delta));

      originalPath.forEach((point, index) => {
        if (index === 0) return;

        const idx = controlPoints.controlPoints.findIndex(
            (it) => it.id === point.id,
        );
        if (index !== -1)
          controlPoints.update(index, {
            position: Vec2.round(Vec2.sub(point.position, delta)),
          });
      });

      recalculateSliderLength(slider);
    });

    window.addEventListener("pointerup", stop, { once: true });
  } else {
    const offset = Vec2.sub(controlPoints.get(index)!.position, mousePos.value);

    const stop = watch(snappedMousePos, (mousePos) => {
      controlPoints.update(index, {
        position: Vec2.round(Vec2.sub(mousePos, slider.position)),
      });

      recalculateSliderLength(slider);
    });

    window.addEventListener("pointerup", stop, { once: true });
  }
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

function insertControlPoint(index: number, position: Vec2) {
  const slider = nn(activeSlider.value);
  slider.controlPoints.insert(index, {
    type: null,
    position,
  });

  if (!selection.isSelected(slider)) {
    selection.select(slider);
  }

  window.addEventListener(
      "pointerup",
      watch(snappedMousePos, (mousePos) => {
        slider.controlPoints.update(index, {
          position: Vec2.round(Vec2.sub(mousePos, slider.position)),
        });
        recalculateSliderLength(slider);
      }),
      { once: true },
  );
}

onKeyDown("q", () => {
  const hitObjects = selection.selectedHitObjects;
  let newCombo = !hitObjects.every(it => it.newCombo);
  hitObjects.forEach(it => it.newCombo = newCombo);
});


onKeyDown("k", () => {
  const hitObjects = selection.selectedHitObjects;
  if (hitObjects.length === 0)
    return;
  const timingPoint = timing.getTimingPointAt(hitObjects[0].startTime);
  const beatLength = timingPoint?.beatDuration ?? (60_000 / 120);
  const divider = 4;

  hitObjects.forEach(it => it.startTime += beatLength / divider);
});

onKeyDown("h", (evt) => {
  if (evt.ctrlKey) {
    evt.preventDefault();
    const hitObjects = selection.selectedHitObjects;
    mirrorHitObjects(hitObjects, "x");
  }
});

onKeyDown("j", (evt) => {
  if (evt.ctrlKey) {
    evt.preventDefault();
    const hitObjects = selection.selectedHitObjects;
    mirrorHitObjects(hitObjects, "y");
  } else {
    evt.preventDefault();
    const hitObjects = selection.selectedHitObjects;
    if (hitObjects.length === 0)
      return;
    const timingPoint = timing.getTimingPointAt(hitObjects[0].startTime);
    const beatLength = timingPoint?.beatDuration ?? (60_000 / 120);
    const divider = 4;

    hitObjects.forEach(it => it.startTime -= beatLength / divider);
  }
});

onKeyDown("ArrowRight", (evt) => {
  if (evt.ctrlKey) {
    evt.preventDefault();
    const hitObjects = selection.selectedHitObjects;
    moveHitObjects(hitObjects, { x: 1, y: 0 });
  }
});


onKeyDown("ArrowUp", (evt) => {
  if (evt.ctrlKey) {
    evt.preventDefault();
    const hitObjects = selection.selectedHitObjects;
    moveHitObjects(hitObjects, { x: 0, y: -1 });
  }
});

onKeyDown("ArrowLeft", (evt) => {
  if (evt.ctrlKey) {
    evt.preventDefault();
    const hitObjects = selection.selectedHitObjects;
    moveHitObjects(hitObjects, { x: -1, y: 0 });
  }
});

onKeyDown("ArrowDown", (evt) => {
  if (evt.ctrlKey) {
    evt.preventDefault();
    const hitObjects = selection.selectedHitObjects;
    moveHitObjects(hitObjects, { x: 0, y: 1 });
  }
});

onKeyDown(",", evt => {
  if (evt.ctrlKey) {
    evt.preventDefault();
    const hitObjects = selection.selectedHitObjects;
    rotateHitObjects(hitObjects, -Math.PI / 2);
  }
});

onKeyDown(".", evt => {
  if (evt.ctrlKey) {
    evt.preventDefault();
    const hitObjects = selection.selectedHitObjects;
    rotateHitObjects(hitObjects, Math.PI / 2);
  }
});

const controlPointMenu = ref(false);
const controlPointMenuPosition = ref(Vec2.zero());
const controlPointMenuIndex = ref(0);
const controlPointMenuObject = shallowRef<Slider>();

function onControlPointTypeSelect(type: PathType | null) {
  if (!controlPointMenuObject.value)
    return;
  controlPointMenuObject.value.controlPoints.update(controlPointMenuIndex.value, { type: type });

  nextTick(() => {
    recalculateSliderLength(controlPointMenuObject.value!);
  });
}

</script>

<template>
  <pixi-container>
    <SelectBox @drag="handleSelectBox" @start="selection.clear()"/>
    <TransformBox v-if="selection.value.size > 0"/>
    <pixi-container :hit-area="hitObjectHitArea" @pointerdown="onMouseDown"/>
    <SliderPathVisualiser
        v-if="activeSlider"
        :slider="activeSlider"
        :show-new-point="true"
        @mousedown:handle="onSliderHandleMouseDown($event.index, $event.evt)"
        @insert="insertControlPoint($event.index, $event.position)"
    />
    <PixiPieMenu :options="[
        ...(controlPointMenuIndex === 0 ? [] : [{ value: null, name: 'Inherit' }]),
        { value: PathType.Bezier , name: 'Bezier'},
        { value: PathType.Catmull , name: 'Catmull'},
        { value: PathType.Linear , name: 'Linear'},
        { value: PathType.BSpline, name: 'BSpline'},
        { value: PathType.PerfectCurve , name: 'Curve'},
    ]"
                 :position="controlPointMenuPosition"
                 v-model:visible="controlPointMenu"
                 @select="onControlPointTypeSelect"
    />
  </pixi-container>
</template>
