<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    ring?: boolean;
    label?: string;
    placeholder?: string;
    class?: HTMLAttributes['class'];
    allowEmpty?: boolean;
  }>(),
  {
    ring: true,
  },
);

const emit = defineEmits<{
  (name: 'update:modelValue', value: number): void;
  (name: 'change', event: Event): void;
}>();

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: number | string | undefined) => {
    if (value === undefined) {
      if (props.allowEmpty) {
        emit('update:modelValue', value as unknown as number);
      } else {
        emit('update:modelValue', props.modelValue as number);
      }
      return;
    }
    if (typeof value === 'string') value = parseFloat(value);

    if (!isNaN(value)) {
      emit('update:modelValue', value);
    }
  },
});

const delegatedProps = computed(() => {
  const { class: _, modelValue, ...delegated } = props;

  return { ...delegated, modelValue: [modelValue] };
});
</script>

<template>
  <TextInput
    v-bind="delegatedProps"
    type="number"
    v-model="modelValue"
    @change="emit('change', $event)"
  />
</template>
