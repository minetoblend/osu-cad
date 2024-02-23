<script setup lang="ts">
import { Vec2 } from '@osucad/common';

const props = defineProps<{
  modelValue: Vec2;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: Vec2): void;
}>();

const x = computed({
  get: () => props.modelValue.x,
  set: (value) =>
    emit('update:modelValue', new Vec2(value, props.modelValue.y)),
});

const y = computed({
  get: () => props.modelValue.y,
  set: (value) =>
    emit('update:modelValue', new Vec2(props.modelValue.x, value)),
});
</script>

<template>
  <div>
    <input v-model.lazy.number="x" type="text" />
    <input v-model.lazy.number="y" type="text" />
  </div>
</template>
