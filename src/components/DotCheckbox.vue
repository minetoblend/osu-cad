<template>
  <div class="dot-checkbox" :class="{checked}" @click="checked = !checked">
    <div class="dot"></div>
  </div>
</template>

<script setup lang="ts">

import {useVModel} from "@vueuse/core";

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const checked = useVModel(props, 'modelValue', emit)

</script>


<style lang="scss">
.dot-checkbox {


  cursor: pointer;
  .dot {
    margin: 8px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: mix(#63E2B7, black, 40%);
    border: 2px solid mix(#63E2B7, black, 20%);
    box-shadow: 0 0 1px 1px rgba(white, 0.3);
    box-sizing: border-box;
  }

  &.checked {
    .dot {
      background-color: #63E2B7;
    }
  }

  &:active {
    .dot {
      box-shadow: 0 0 1px 1px rgba(white, 0.15);
    }
  }
}
</style>
