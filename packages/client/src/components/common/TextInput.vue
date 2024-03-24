<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    ring?: boolean;
    type?: string;
    label?: string;
    placeholder?: string;
  }>(),
  {
    ring: true,
  },
);

const emit = defineEmits<{
  (name: 'update:modelValue', value: string): void;
  (name: 'change', event: Event): void;
}>();

const modelValue = useVModel(props, 'modelValue', emit);

const el = ref();
const { focused } = useFocusWithin(el);
const empty = computed(() => {
  return (
    modelValue.value === '' ||
    modelValue.value === undefined ||
    modelValue.value === null
  );
});
</script>

<template>
  <div ref="el" class="relative">
    <label
      v-if="label"
      class="absolute text-gray-600 py-2 px-3 transition-transform"
      :class="[(!empty || focused) && 'translate-x--3 translate-y--5 scale-80']"
    >
      {{ label }}
    </label>
    <input
      :type="type"
      v-model="modelValue"
      :placeholder="placeholder"
      class="bg-gray-300 py-2 px-3 w-full rounded focus:outline-none"
      :class="[
        ring &&
          'transition-shadow focus:(ring-primary-600 ring-3 ring-opacity-35)',
      ]"
      @change="emit('change', $event)"
    />
  </div>
</template>
