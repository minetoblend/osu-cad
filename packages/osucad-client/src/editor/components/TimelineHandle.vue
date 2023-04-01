<script setup lang="ts">
const props = defineProps<{
  timing?: boolean;
  me?: boolean;
  style?: any;
  active?: boolean;
}>();


</script>

<template>
  <div class="handle" :class="{ timing, me, active }" :style="style" />
</template>

<style lang="scss" scoped>
.handle {
  position: absolute;

  top: 50%;
  background-color: white;
  transform: translate(-50%, -50%);

  width: 6px;
  height: 14px;
  border-radius: 3px;

  &.me {
    width: 8px;
    height: 18px;
    border-radius: 4px;
  }

  &.timing {
    width: 3px;
    height: 12px;
    border-radius: 1.5px;
    background-color: #63e2b7;

    &.inherited {
      background-color: #ea2463;
    }
  }

  &.active {
    transform: translate(-50%, -50%) scale(1.1);
  }
}
</style>
