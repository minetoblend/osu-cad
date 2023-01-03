<template>
  <button class="tab-button" :class="{active}" @click="modelValue = tab">
    <div class="content">
      <slot/>
    </div>
  </button>
</template>

<script setup lang="ts">

import {computedEager, useVModel} from "@vueuse/core";

const props = defineProps<{
  modelValue: string
  tab: string
}>()

const modelValue = useVModel(props, 'modelValue')

const active = computedEager(() => modelValue.value === props.tab)

</script>

<style lang="scss">

$transition-duration: 0.07s;

.tab-button {
  background: none;
  border: none;
  color: white;
  font-family: "Saira", sans-serif;
  font-size: 21.5px;
  transition: background-color $transition-duration linear, color $transition-duration linear;
  cursor: pointer;
  padding: 0 12px;

  .content {
    text-shadow: 0 0 0 0 transparent;
    transition: text-shadow $transition-duration linear, transform $transition-duration linear;
  }

  &:hover {
    background-color: rgba(#63E2B7, 0.1);
  }

  &.active {
    background-color: rgba(#63E2B7, 0.2);
    color: #63E2B7;

    .content {
      transform: translate(0.5px, -0.5px);
      text-shadow: -1px 2px 0 rgba(255, 255, 255, 0.25);
    }
  }

  &:focus {
    outline: none;
  }

}
</style>
