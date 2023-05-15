<script setup lang="ts">
import {formatTimestamp} from "@/utils/format";
import {useEditor} from "../createEditor";
import {ref} from "vue";
import VolumeSlider from "../../components/VolumeSlider.vue";
import TimelineOverview from "./TimelineOverview.vue";
import TimelineRhythm from "./TimelineRhythm.vue";
import {seekOnScroll} from "@/composables/seekOnScroll";

const { clock, users, timing } = useEditor()!;

const togglePlay = () => (clock.isPlaying ? clock.pause() : clock.play());

const timelineContainer = ref();
seekOnScroll(timelineContainer);

function copyTimestamp() {
  const time = Math.floor(clock.currentTime);
  const url = new URL(window.location.href);
  url.searchParams.set("t", time.toString());

  navigator.clipboard.writeText(url.toString());
}

function cyclePlaybackSpeed() {
  const speeds = [1.5, 1, 0.75, 0.5]

  const index = speeds.indexOf(clock.playbackSpeed)
  if(index === -1)
    clock.playbackSpeed = 1
  else
    clock.playbackSpeed = speeds[(index + 1) % speeds.length]
}

</script>

<template>
  <div class="timeline">
    <div class="timeline-controls">
      <button class="play-pause" @click="togglePlay">
        <img v-if="clock.isPlaying" src="@/assets/icons/pause-solid.svg" />
        <img v-else src="@/assets/icons/play-solid.svg" />
      </button>
      <VolumeSlider class="volume-control" />
      <button class="playback-speed" @click="cyclePlaybackSpeed">
        {{clock.playbackSpeed * 100}}%
      </button>
      <div class="current-time" @click="copyTimestamp">
        {{ formatTimestamp(clock.currentTimeAnimated) }}
      </div>
    </div>
    <div ref="timelineContainer" class="timeline-container">
      <TimelineRhythm class="timeline-rhythm" />
      <TimelineOverview class="timeline-overview" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.timeline {
  border-top: 1px solid rgba(#ccc, 0.2);
  height: 100px;
  display: flex;
  align-items: stretch;
  user-select: none;

  .timeline-controls {
    position: absolute;
    width: 176px;

    .play-pause {
      position: absolute;
      top: 0;
      left: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: none;
      border: none;
      outline: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        transform: scale(1.05);
      }

      img {
        width: 24px;
        height: 24px;
      }
    }

    .volume-control {
      position: absolute;
      top: 0;
      left: 40px;
      width: 40px;
      height: 40px;
    }

    .playback-speed {
      all: unset;
      position: absolute;
      top: 0;
      left: 80px;
      width: 96px;
      height: 40px;
      cursor: pointer;
    }

    .current-time {
      position: absolute;
      top: 40px;
      left: 0;
      height: 60xp;
      height: 176px;
      font-size: 32px;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
    }
  }

  .timeline-container {
    overflow: hidden;
    flex-grow: 1;
    position: absolute;
    top: 0;
    left: 176px;
    right: 0;
    bottom: 0;

    .timeline-rhythm {
      width: 100%;
      height: 66%;
    }

    .timeline-overview {
      width: 100%;
      height: 33%;
    }
  }
}
</style>
