<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'primary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  outline?: boolean;
}>();
const classes = computed(() => {
  const classes: string[] = [
    `oc-btn--${props.variant ?? 'primary'}`,
    `oc-btn--${props.size ?? 'md'}`,
  ];

  if (props.outline) {
    classes.push('oc-btn--outline');
  }

  return classes;
});
</script>

<template>
  <button class="oc-btn" :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>

<style lang="scss">
.oc-btn {
  border-radius: 4px;
  color: $text-color;
  outline: none;
  border: none;

  transition: box-shadow 0.1s linear;
  cursor: pointer;

  font-family: inherit;

  &:focus {
    outline: none;
  }

  @each $name, $color in $theme-colors {
    &--#{$name} {
      background-color: $color;
      box-shadow: 0 0 0 rgba($color, 0);

      &:hover {
        background-color: lighten($color, 5%);
      }

      &:active {
        background-color: darken($color, 5%);
        transform: scale(0.98);
      }

      &:focus-visible {
        box-shadow: 0 0 0 $focus-ring-width rgba($color, $focus-ring-alpha);
      }

      &.oc-btn--outline {
        background-color: transparent;
        border: 1px solid $color;
        color: $color;

        &:hover {
          background-color: rgba($color, 0.1);
          color: $text-color;
        }
      }
    }
  }

  &--sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }

  &--md {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  &--lg {
    padding: 0.5rem 1rem;
    font-size: 1.1rem;
  }
}
</style>
