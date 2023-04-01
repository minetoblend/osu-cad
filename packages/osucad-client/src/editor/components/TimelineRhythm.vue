<script setup lang="ts">
import {computed, ref} from "vue";
import {useEditor} from "../createEditor";
import TimelineRhythmObject from "./TimelineRhythmObject.vue";
import {useElementSize, useEventListener} from "@vueuse/core";

const { clock, timing, container, selection } = useEditor()!;

const zoom = ref(1);
const el = ref<HTMLElement>();

const visibleDuration = computed(() => zoom.value * 4000);

const { width: containerWidth } = useElementSize(el);

const visibleSpan = computed(() => ({
  start: clock.currentTimeAnimated - visibleDuration.value / 2,
  end: clock.currentTimeAnimated + visibleDuration.value / 2,
}));

const tickContainer = ref();

interface ISelection {
  start: number;
  end: number;
}
const selectionRange = ref<ISelection>();

const ticks = computed(() => {
  const start = Math.floor(visibleSpan.value.start / 1000) * 1000;
  const end = Math.ceil(visibleSpan.value.end / 1000) * 1000;
  return timing.generateTicks(start, end, 4).map((tick) => ({
    time: tick.time,
    type: tick.type,
    style: {
      left: `${
        ((tick.time - visibleSpan.value.start) / visibleDuration.value) * 100
      }%`,
    },
  }));
});

function onPointerDown(evt: PointerEvent) {
  const evtToTime = (evt: PointerEvent) => {
    const rect = el.value!.getBoundingClientRect();
    const x = evt.clientX - rect.left;

    const t =
      (x / rect.width) * visibleDuration.value + visibleSpan.value.start;
    return t;
  };

  const selectionStart = evtToTime(evt);

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", function onPointerUp(evt) {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);

    if (selectionRange.value) {
      const selectedObjects =
        container.document.objects.hitObjects.items.filter(
          (hitObject) =>
            hitObject.startTime >= selectionRange.value!.start &&
            hitObject.startTime <= selectionRange.value!.end
        );
      selection.select(...selectedObjects);
    } else {
      selection.select();
    }

    selectionRange.value = undefined;
  });

  function onPointerMove(evt: PointerEvent) {
    const time = evtToTime(evt);

    selectionRange.value = {
      start: Math.min(selectionStart, time),
      end: Math.max(selectionStart, time),
    };
  }
}

function timeToPercent(time: number) {
  return (time / visibleDuration.value) * 100 + "%";
}

const hitObjects = computed(() =>
  container.document.objects.hitObjects
    .getRange(visibleSpan.value.start, visibleSpan.value.end)
    .reverse()
);

useEventListener(el, "wheel", (evt: WheelEvent) => {
  if (evt.ctrlKey) {
    evt.preventDefault();

    const delta = Math.sign(evt.deltaY) * 0.1;

    zoom.value = Math.max(0.1, zoom.value * (1 + delta));
  }
});
</script>

<template>
  <div ref="el" class="timeline-rhythm" @pointerdown="onPointerDown">
    <div ref="tickContainer" class="ticks">
      <div class="hitobject-lane-background" />
      <div>
        <div
          class="tick"
          v-for="tick in ticks"
          :key="tick.time.toString()"
          :class="'t-' + tick.type"
          :style="tick.style"
        />
      </div>
      <div
        v-if="selectionRange"
        class="selection-overlay"
        :style="{
          left: timeToPercent(selectionRange.start - visibleSpan.start),
          width: timeToPercent(selectionRange.end - selectionRange.start),
        }"
      />
    </div>
    <div class="hitobject-container">
      <TimelineRhythmObject
        v-for="hitObject in hitObjects"
        :key="hitObject.id"
        :hitObject="hitObject"
        :start="visibleSpan.start"
        :end="visibleSpan.end"
        :width="containerWidth"
        :selection-start="selectionRange?.start"
        :selection-end="selectionRange?.end"
      />
    </div>
    <div class="current-time-indicator" />
  </div>
</template>

<style lang="scss">
.timeline-rhythm {
  position: relative;

  //total height: 66px

  .current-time-indicator {
    position: absolute;
    width: 3px;
    top: 0;
    bottom: 0;
    left: 50%;
    border-radius: 1.5px;
    background: #63e2b7;
    transform: translate(-50%, 0);
  }

  .hitobject-container {
    position: absolute;
    left: 0;
    right: 0;
    box-sizing: border-box;
    top: 13px;
    bottom: 13px;
    // height: 40px;
  }

  .ticks {
    position: absolute;
    inset: 0;

    .tick {
      position: absolute;
      width: 2px;
      top: 50%;
      height: 90%;
      background: white;
      border-radius: 1px;

      transform: translate(-50%, -50%);

      &.t-0 {
        // Full
        height: 80%;
        width: 3px;
        border-radius: 1.5px;
      }

      &.t-1 {
        // Half
        height: 70%;
        background: #ea2463;
      }

      &.t-2 {
        // Third
        height: 60%;
        background: rgb(216, 19, 216);
      }

      &.t-3 {
        // Quarter
        height: 50%;
        background: rgb(43, 43, 255);
      }

      &.t-4 {
        // Sixth
        height: 50%;
        background: yellow;
      }

      &.t-5 {
        // Other
        height: 50%;
        background: gray;
      }
    }

    .hitobject-lane-background {
      height: 40%;
      top: 30%;
      width: 100%;
      position: absolute;
      background: rgba(white, 0.05);
    }

    .selection-overlay {
      position: absolute;
      top: 0;
      bottom: 0;
      background: rgba(white, 0.1);
    }
  }
}
</style>
