<template>
  <div class="pane">
    <div class="pane-header" v-if="title || $slots.header">
      <slot name="header">
        {{ title }}
      </slot>
    </div>
    <div class="pane-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  title?: string
}>()

</script>

<style lang="scss">

.pane {
  //border: 1px solid #ccc;
  display: block;
  border-radius: 4px;
  background-color: #343440;

  .pane-header {
    height: 48px;
    border-bottom: 1px solid #1A1A20;
    display: flex;
    padding: 0 16px;
    align-items: center;
  }

  .pane-body {
    padding: 16px;
  }
}

</style>
