<template>
  <div class="track-channel">
    <dot-checkbox v-model="channel.enabled"/>
    <knob-input v-model="channel.volume" :color="channel.color" :inactive="!channel.enabled" :max="1.25"/>
    <editable-label class="channel-name" v-model="channel.name"/>
    <div class="channel-lane" ref="lane">

    </div>
  </div>
</template>

<script setup lang="ts">
import DotCheckbox from "@/components/DotCheckbox.vue";
import KnobInput from "@/components/KnobInput.vue";
import EditableLabel from "@/components/EditableLabel.vue";
import {computed, ref} from "vue";
import {useMouseInElement} from "@vueuse/core";

const props = defineProps<{
  channel: any
}>();

const startTime = 0
const endTime = 4000

const snapTargets = computed(() => {
  const ticks = []
  for (let i = startTime; i < endTime; i += 100) {
    ticks.push(i)
  }
  return ticks
})

const lane = ref<HTMLDivElement>()

const {elementX, isOutside, elementWidth} = useMouseInElement(lane)

const activeTick = computed(() => {
  if (isOutside.value) return null

  const timingPointOffset = 30

  const timeAtCursor = (elementX.value / elementWidth.value) * (endTime - startTime) + startTime - timingPointOffset

  const interval = 100

  return Math.round(timeAtCursor / interval) * interval + timingPointOffset
})

</script>

<style lang="scss">

.track-channel {
  display: flex;
  align-items: center;
  height: 48px;

  .channel-name {
    width: 150px;
    margin-left: 6px;

    text-overflow: ellipsis;
  }

  .channel-lane {
    flex-grow: 1;
    height: 100%;
    position: relative;
  }

  .hitsound-cursor {
    position: absolute;
    width: 32px;
    height: 32px;
    top: 8px;
    transform: translateX(-16px);

    background: rgba(white, 0.05);

  }
}

</style>
