<script setup lang="ts">
import {HitObject} from "@osucad/common";
import {computed} from "@vue/reactivity";
import {useEditor} from "../createEditor";

const { timing, selection, colors } = useEditor()!;

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
    backgroundColor: '#' + colors.getColor(props.hitObject.comboIndex).toString(16),
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
</script>

<template>
  <div
    class="timeline-entry circle"
    :class="{ selected: isSelected || isSelectionCandidate }"
    :style="style"
    @pointerdown.stop.prevent="onPointerDown"
  >
    {{ hitObject.comboNumber }}
  </div>
</template>

<style lang="scss" scoped>
.timeline-entry {
  position: absolute;
  box-sizing: border-box;
  transform: translateX(-25px);
  top: 0;

  &.circle {
    width: 50px;
    height: 50px;

    background-color: #4287f5;
    border: 3px solid white;
    border-radius: 25px;

    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 1.5rem;
    font-weight: bold;

    &.selected {
      outline: 3px solid #f5d442;
    }
  }
}
</style>
