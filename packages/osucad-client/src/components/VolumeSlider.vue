<script setup lang="ts">
import {useElementHover, useLocalStorage} from "@vueuse/core";
import {ref, watch} from "vue";
import {sound} from "@pixi/sound";

import volumeFull from "../assets/icons/volume-full.svg";
import volumeMid from "../assets/icons/volume-mid.svg";
import volumeLow from "../assets/icons/volume-low.svg";
import volumeOff from "../assets/icons/volume-off.svg";
import {computed} from "@vue/reactivity";

const volume = useLocalStorage("volume", 1)

watch(volume, (volume) => {
  sound.volumeAll = volume;
}, { immediate: true });

const el = ref();
const isHovering = useElementHover(el);

const volumeIcon = computed(() => {
  if (volume.value === 0) return volumeOff;
  if (volume.value < 0.3) return volumeLow;
  if (volume.value < 0.7) return volumeMid;
  return volumeFull;
});

</script>

<template>
  <div class="volume-control" ref="el">
    <button>
      <img :src="volumeIcon" />
    </button>
    <Transition>
      <div v-if="isHovering" class="slider">
        <input
          type="range"
          orient="vertical"
          v-model="volume"
          min="0"
          max="1"
          step="0.01"
        />
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.volume-control {
  position: relative;

  button {
    height: 100%;
    aspect-ratio: 1;
    background: none;
    border: none;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      shape-rendering: crispEdges;
    }
  }

  .slider {
    position: absolute;
    bottom: 100%;
    width: 100%;
    display: flex;
    justify-content: center;

    input {
      width: 10px;
      height: 80px;
      -webkit-appearance: slider-vertical;
      appearance: slider-vertical;
      writing-mode: bt-lr;
    }
  }
}
</style>
