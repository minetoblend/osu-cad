<template>
  <div class="presence-container" :class="{'has-presence': presences.length > 0}">
    <slot></slot>

    <div class="presences">
      <div class="presence" v-for="presence in presences" :key="presence.id" :style="{background: presence.color}">
        {{ presence.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {computed} from "vue";

const props = defineProps<{
  presences: any[];
}>();

const color = computed(() => props.presences[props.presences.length - 1]?.color)

</script>

<style lang="scss" scoped>
.presence-container {
  position: relative;
  border-radius: var(--border-radius);

  transition: box-shadow 0.1s ease-out;

  &.has-presence, &:focus-within {
    box-shadow: 0 0 0 2px v-bind(color);
  }

  .presences {
    position: absolute;
    top: -10px;
    right: 10px;
    display: flex;
    gap: 4px;

    .presence{
      padding: 1px 6px;
      border-radius: 2px;
    }
  }
}
</style>
