<template>
  <div class="hit-object-timeline">
    <div class="hit-objects" ref="hitObjectContainer">
      <hit-object-timeline-hit-object v-for="hitObject in visibleHitObjects"
                                      :key="hitObject.id"
                                      :hit-object="hitObject"
                                      :x-pos="getXPosition(hitObject.startTime)"
      />
    </div>
    <div class="current-time-indicator"/>
    {{ currentTime }}
  </div>
</template>

<script setup lang="ts">

import {useEditor, useHitObjects} from "@/editor";
import {useClock, useCurrentTime} from "@/editor/clock";
import {computed, onMounted, ref} from "vue";
import {computedEager, useElementSize} from "@vueuse/core";
import {binarySearch} from "@/util/binarySearch";
import HitObjectTimelineHitObject from "@/editor/components/HitObjectTimelineHitObject.vue";
import {DIRECTION_HORIZONTAL, Manager, Pan} from "hammerjs";
import {Capacitor} from '@capacitor/core';
import {usePlatform} from "@/util/platform";

const hitObjects = useHitObjects()

const currentTime = useCurrentTime(true)

const zoom = ref(1)

const baseVisileDuration = 4000

const hitObjectContainer = ref<HTMLDivElement>()

const startTime = computed(() => currentTime.value - baseVisileDuration / 2)
const endTime = computed(() => currentTime.value + baseVisileDuration / 2)

const visibleHitObjects = computed(() => {
  const {index: startIndex} = binarySearch(hitObjects, h => h.endTime, startTime.value)
  const {index: endIndex} = binarySearch(hitObjects, h => h.startTime, endTime.value)

  return hitObjects.slice(Math.max(startIndex - 1, 0), Math.min(endIndex + 1, hitObjects.length))
})

const {width: containerWidth} = useElementSize(hitObjectContainer)

function getXPosition(time: number) {
  return (time - startTime.value) / baseVisileDuration * containerWidth.value
}

const clock = useClock()

if (usePlatform().isMobile || true) {

  onMounted(() => {

    const mc = new Manager(hitObjectContainer.value!)

    const pan = new Pan({direction: DIRECTION_HORIZONTAL})

    mc.add(pan)

    let lastX = 0
    mc.on('pan', evt => {
      if (evt.isFirst)
        lastX = 0

      clock.seek(clock.currentTime.value - ((evt.deltaX - lastX) * (endTime.value - startTime.value) / containerWidth.value), false)
      lastX = evt.deltaX
    })
  })

}
</script>

<style lang="scss">
.hit-object-timeline {
  position: relative;
  height: 48px + 16px;
  padding: 8px;

  .current-time-indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    background: white;
  }
}
</style>
