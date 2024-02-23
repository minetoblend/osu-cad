<script setup lang="ts">
const props = defineProps<{
  items: {
    label: string;
    value: string;
  }[];
  modelValue: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const modelValue = useVModel(props, 'modelValue', emit);
</script>

<template>
  <div class="tablist">
    <button
      v-for="button in items"
      :key="button.value"
      class="tablist-button"
      :class="{ active: modelValue === button.value }"
      @click="modelValue = button.value"
    >
      {{ button.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.tablist {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &-button {
    padding: 0.75rem 1rem;
    appearance: none;
    font-size: 1rem;
    border-radius: 4px;
    background-color: transparent;
    border: none;
    cursor: pointer;

    &:hover {
      background-color: rgba(white, 0.05);
    }

    &:active {
      background-color: rgba(black, 0.05);
      transform: scale(0.98);
    }

    &.active {
      background-color: rgba(white, 0.1);

      &:hover {
        background-color: rgba(white, 0.2);
      }

      &:active {
        background-color: rgba(white, 0.3);
      }
    }
  }
}
</style>
