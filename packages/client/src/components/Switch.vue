<script setup lang="ts">
defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
}>();
</script>

<template>
  <div
    class="switch transition-shadow transition-colors focus-within:(ring-3 ring-primary-600 ring-opacity-35)"
    @click="emit('update:modelValue', !modelValue)"
  >
    <input type="checkbox" :checked="modelValue" />
    <div class="knob" />
  </div>
</template>

<style scoped lang="scss">
$height: 1.5em;
$width: 2.5em;

.switch {
  position: relative;
  display: inline-block;
  width: $width;
  height: $height;
  cursor: pointer;
  background-color: $surface-100;
  border-radius: $height * 0.5;
}

.switch input {
  opacity: 0;
  pointer-events: none;
}

.knob {
  position: absolute;
  top: 0;
  left: 0;
  width: $height;
  height: $height;
  background-color: $surface-300;
  border-radius: 50%;
  transition:
    left 0.15s ease-out,
    background-color 0.15s ease-out;
  transform: scale(0.8);
}

.switch input:checked + .knob {
  left: $width - $height;
  background-color: $surface-50;
  box-shadow: inset 0 0 5px rgba($primary, 0.4);
}

.switch:has(input:checked) {
  background-color: $primary;
}
</style>
