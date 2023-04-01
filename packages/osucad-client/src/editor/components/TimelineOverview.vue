<script setup lang="ts">
import {ref, shallowRef} from "vue";
import {useEditor} from "../createEditor";
import {unrefElement, useRafFn} from "@vueuse/core";
import {computed} from "@vue/reactivity";
import TimelineHandle from "./TimelineHandle.vue";

const { clock, users, container } = useEditor()!;
const el = ref<HTMLElement>();
const progress = ref(0);

useRafFn(() => {
  progress.value = clock.progress;
});

const userTimes = computed(() => {
  return container.users
    .getClientStateForAll("currentTime")
    .filter(({ value }) => !!value)
    .map(({ user, value }) => {
      const { time } = value as { time: number };

      return {
        id: user.clientId,
        style: {
          left: (time / clock.duration) * 100 + "%",
          backgroundColor: user.data.color,
        },
      };
    });
});

const timingPoints = shallowRef(container.document.objects.timing.items);

container.document.objects.timing.on("change", () => {
  timingPoints.value = container.document.objects.timing.items;
});

const isDragging = ref(false);

function onPointerDown(evt: MouseEvent) {
  isDragging.value = true;
  window.addEventListener("pointermove", updateTimeFromEvent);
  window.addEventListener("pointerup", function onPointerUp() {
    window.removeEventListener("pointermove", updateTimeFromEvent);
    window.removeEventListener("pointerup", onPointerUp);
    isDragging.value = false;
  });
  updateTimeFromEvent(evt);
}

function updateTimeFromEvent(evt: MouseEvent) {
  const timeline = unrefElement(el);
  if (!timeline) return;

  const padding = 8;

  const rect = timeline.getBoundingClientRect();
  const x = evt.clientX - (rect.left + padding);
  const width = rect.width - padding * 2;

  const time = (x / width) * clock.duration;

  if (!isNaN(time)) {
    clock.seek(time);
  }
}
</script>

<template>
  <div ref="el" class="timeline-overview" @pointerdown="onPointerDown">
    <div class="progress-bar">
      <div class="progress" :style="{ width: progress * 100 + '%' }" />
      <TimelineHandle
        timing
        v-for="timingPoint in timingPoints"
        :key="timingPoint.id"
        :style="{ left: (timingPoint.offset / clock.duration) * 100 + '%' }"
      />
      <TimelineHandle
        v-for="user in userTimes"
        :key="user.id"
        :style="user.style"
      />
      <TimelineHandle
        me
        :active="isDragging"
        :style="{ left: progress * 100 + '%' }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.timeline-overview {
  box-sizing: border-box;

  display: flex;
  align-items: center;
  padding: 0 8px;

  .progress-bar {
    height: 8px;
    flex-grow: 1;
    background: rgba(white, 0.1);
    border-radius: 4px;
    position: relative;

    .progress {
      height: 8px;
      background: rgba(white, 0.5);
      border-radius: 4px;
    }
  }

  &:hover .handle.me,
  &.handle.me.dragging {
    width: 10px;
    height: 22px;
    border-radius: 5px;
  }
}
</style>
