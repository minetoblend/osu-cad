<template>
  <div class="circle" :style="style">
    {{ comboIndex }}
  </div>
</template>

<script setup lang="ts">
import {HitObject} from "@/editor/state/hitobject";
import {computed} from "vue";

const props = defineProps<{
  hitObject: HitObject,
  xPos: number
}>()

const comboIndex = 1

const style = computed(() => {
  return {
    transform: `translateX(${props.xPos}px)`
  }
})
</script>

<style lang="scss">

.circle {
  width: 48px;
  height: 48px;
  background: red;
  border-radius: 50%;
  border: 6px solid rgba(white, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: rgba(white, 0.9);

  position: absolute;
  top: 8px;
}

</style>
