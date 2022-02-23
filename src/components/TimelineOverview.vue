<template>
  <div class="timeline-overview">
    <div class="timeline-current-time">
      {{ currentTimeMinutes }} : {{ currentTimeSeconds }} : {{ currentTimeMs }}
    </div>
    <div class="play-pause-button">
      <icon v-if="!isPlaying" icon="play" @click="context.playback.play()" fixed-width />
      <icon v-else icon="pause" @click="context.playback.pause()" fixed-width />
    </div>
    <div class="timeline-container">
      <div class="timeline-objects" ref="dragArea" @mousedown="seekStart">
        <div class="current-time-indicator" :style="{left: `${currentTimeRelative * 100}%`}"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from "vue";
import {injectContext} from "@/util/inject";
import {getRelativePosition, startGlobalDragAction} from "@/util/mouse";

export default defineComponent({
  setup() {
    const context = injectContext()

    const currentTimeRelative = computed(() => context.playback!.currentTime.value / context.songDuration.value)


    return {
      context,
      currentTimeRelative,
      currentTime: context.playback!.currentTime,
      currentTimeMinutes: computed(() => Math.floor(context.playback!.currentTime.value / 60_000).toString().padStart(2, '0')),
      currentTimeSeconds: computed(() => Math.floor((context.playback!.currentTime.value / 1_000) % 60).toString().padStart(2, '0')),
      currentTimeMs: computed(() => Math.floor(context.playback!.currentTime.value % 1000).toString().padStart(3, '0')),
      dragArea: ref<HTMLDivElement>(),
      isPlaying: context.playback!.isPlaying
    }
  },
  methods: {
    seekStart(evt: MouseEvent) {
      if (evt.button === 0)
        startGlobalDragAction(this.dragArea!, {
          onDrag: (evt: MouseEvent) => {
            const pos = getRelativePosition(evt, this.dragArea!)
            const relativeTime = pos.x / this.dragArea!.clientWidth
            this.context.playback!.seekRelative(relativeTime)
          },
          onDragEnd: (evt: MouseEvent) => {
            const pos = getRelativePosition(evt, this.dragArea!)
            const relativeTime = pos.x / this.dragArea!.clientWidth
            this.context.playback!.seekRelative(relativeTime)
          }
        })
    }
  }
})
</script>

<style lang="scss" scoped>
.timeline-overview {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: $gray-100;
  display: flex;
  padding: 10px;
  align-items: center;
  user-select: none;

  .timeline-current-time {
    margin-right: 10px;
    width: 100px;
    font-variant-numeric: tabular-nums;
  }

  .play-pause-button {
    margin-right: 10px;
    > * {
      cursor: pointer;
    }
  }

  .timeline-container {
    height: 100%;
    flex-grow: 1;
    position: relative;
    background-color: $gray-300;
    border-radius: 5px;

    .timeline-objects {
      position: absolute;
      left: 10px;
      right: 10px;
      top: 5%;
      bottom: 5%;

      .current-time-indicator {
        position: absolute;
        width: 3px;
        transform: translateX(-1.5px);
        height: 100%;
        background-color: $primary;
      }

    }
  }
}
</style>