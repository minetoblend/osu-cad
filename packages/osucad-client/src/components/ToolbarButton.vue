<script setup lang="ts">
defineProps<{
  active?: boolean;
}>();
</script>

<template>
  <button :class="{ active }">
    <slot />
  </button>
</template>

<style lang="scss">
button {
  all: unset;
  width: 48px;
  height: 48px;
  flex-grow: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  img {
    width: 75%;
    height: 75%;
    object-fit: contain;
  }

  transition: background-color 0.15s ease-in-out;

  &.active {
    background-color: rgba(#63e2b7, 0.15);

    img {
      filter: invert(0.5) sepia(1) saturate(5) hue-rotate(135deg)
        drop-shadow(2px 2px 4px rgba(white, 0.5));
    }
  }
}
</style>
