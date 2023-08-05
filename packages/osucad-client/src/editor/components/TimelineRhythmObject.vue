<script setup lang="ts">
import {HitObject, Slider} from "@osucad/common";
import {computed} from "@vue/reactivity";
import {useEditor} from "../createEditor";

const { timing, selection, colors, hitObjects } = useEditor()!;

const props = defineProps<{
  hitObject: HitObject;
  start: number;
  end: number;
  width: number;

  selectionStart?: number;
  selectionEnd?: number;
}>();

const style = computed(() => {
  return {
    left: `${
        ((props.hitObject.startTime - props.start) / (props.end - props.start)) *
        100
    }%`,
  };
});

const isSelected = computed(() => {
  return (
      props.selectionStart === undefined && selection.isSelected(props.hitObject)
  );
});

const isSelectionCandidate = computed(() => {
  return (
      props.selectionStart !== undefined &&
      props.selectionEnd !== undefined &&
      props.hitObject.startTime >= props.selectionStart &&
      props.hitObject.startTime <= props.selectionEnd
  );
});

function onPointerDown(evt: PointerEvent) {
  let startTime = props.hitObject.startTime;
  let startX = evt.clientX;

  if (evt.button === 2) {
    evt.preventDefault();
    hitObjects.remove(props.hitObject);
    return;
  }

  if (evt.ctrlKey) selection.add(props.hitObject);
  else {
    if (!selection.isSelected(props.hitObject))
      selection.select(props.hitObject);
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", function onPointerUp(evt) {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  });

  function onPointerMove(evt: PointerEvent) {
    const diff = (evt.clientX - startX) / props.width;

    const diffTime = diff * (props.end - props.start);

    let newTime = startTime + diffTime;

    if (!evt.shiftKey) {
      newTime = timing.snapTime(newTime, 4);
    }

    if (newTime !== props.hitObject.startTime) {
      const diff = newTime - props.hitObject.startTime;
      selection.selectedHitObjects.forEach((hitObject) => {
        hitObject.startTime += diff;
      });
    }
  }
}

function onSliderEndPointerDown(evt: PointerEvent) {
  const slider = props.hitObject as Slider;
  if (evt.ctrlKey) {
    const { startTime, endTime, duration, velocity, velocityMultiplier } =
        slider;
    const startX = evt.clientX;

    function onPointerMove(evt: PointerEvent) {
      const diff = (evt.clientX - startX) / props.width;

      const diffTime = diff * (props.end - props.start);

      const newTime = timing.snapTime(endTime + diffTime, 4);

      let newDuration = newTime - startTime;

      const newVelocity = (velocity * duration) / newDuration;

      slider.velocityMultiplier = (newVelocity / velocity) * velocityMultiplier;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener(
        "pointerup",
        () => window.removeEventListener("pointermove", onPointerMove),
        { once: true },
    );
    return;
  }

  const {
    startTime,
    endTime,
    duration,
    spanDuration,
    velocity,
    velocityMultiplier,
  } = slider;
  const startX = evt.clientX;

  function onPointerMove(evt: PointerEvent) {
    const diff = (evt.clientX - startX) / props.width;

    const diffTime = diff * (props.end - props.start);

    const newTime = timing.snapTime(endTime + diffTime, 4);

    let newDuration = newTime - startTime;

    const spanCount = Math.max(1, Math.round(newDuration / spanDuration));

    slider.spans = spanCount;
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener(
      "pointerup",
      () => window.removeEventListener("pointermove", onPointerMove),
      { once: true },
  );
}

const type = computed(() => {
  if (props.hitObject instanceof Slider) return "slider";
  return "circle";
});

const duration = computed(() => {
  if (props.hitObject instanceof Slider) return props.hitObject.duration;
  return 0;
});

const background = computed(
    () => "#" + colors.getColor(props.hitObject.comboIndex).toString(16),
);

const velocityMultiplier = computed(() =>
    props.hitObject instanceof Slider ? props.hitObject.velocityMultiplier : 1,
);

const spans = computed(() =>
    props.hitObject instanceof Slider ? props.hitObject.spans : 1,
);
</script>

<template>
  <div :style="style" class="timeline-entry">
    <div
        v-if="type === 'slider'"
        class="slider"
        :class="{ selected: isSelected || isSelectionCandidate }"
        :style="{
        width: `calc(${
          (duration / (props.end - props.start)) * props.width + 'px'
        } + 40px)`,
      }"
        @pointerdown.stop.prevent="onPointerDown"
    >
      <div
          class="span"
          v-for="i in spans - 1"
          :style="{
          left: `${
            (((duration / spans) * (i - 1)) / (props.end - props.start)) *
            props.width
          }px`,
        }"
      />
      <div v-if="velocityMultiplier !== 1" class="velocity-multiplier">
        sv: {{ velocityMultiplier.toFixed(1) }}
      </div>
    </div>
    <div
        v-if="type === 'slider'"
        class="circle"
        :style="{
        left: (duration / (props.end - props.start)) * props.width + 'px',
      }"
        @pointerdown.stop.prevent="onSliderEndPointerDown"
    />
    <div
        class="circle"
        :class="{
        selected: type !== 'slider' && (isSelected || isSelectionCandidate),
      }"
        @pointerdown.stop.prevent="onPointerDown"
    >
      {{ hitObject.comboNumber }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.timeline-entry {
  position: absolute;
  box-sizing: border-box;
  transform: translate(-20px, 3px);
  top: 0;

  .circle {
    width: 40px;
    height: 40px;
    position: absolute;
    box-sizing: border-box;
    background: v-bind(background);

    border: 3px solid white;
    border-radius: 20px;

    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 1.2rem;
    font-weight: bold;

    cursor: ew-resize;

    &.selected {
      outline: 3px solid #f5d442;
    }
  }

  .slider {
    // width: 50px;
    background: v-bind(background);
    height: 40px;
    position: absolute;
    box-sizing: border-box;

    border: 3px solid white;
    border-radius: 20px;

    display: flex;
    justify-content: center;
    align-items: center;

    .velocity-multiplier {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -60%);
      border-radius: 15px;
      background-color: rgba(#777, 0.7);
      color: white;
      padding: 0 7px;
      white-space: nowrap;
      z-index: 100;
    }

    &.selected {
      outline: 3px solid #f5d442;
    }
  }
}
</style>
