<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue';
import type { SliderRootEmits, SliderRootProps } from 'radix-vue';
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  useForwardPropsEmits,
} from 'radix-vue';
import { cn } from '@/utils';

const props = defineProps<
  Omit<SliderRootProps, 'modelValue'> & {
    class?: HTMLAttributes['class'];
    modelValue: number;
  }
>();

const emits = defineEmits<SliderRootEmits>();

const delegatedProps = computed(() => {
  const { class: _, modelValue, ...delegated } = props;

  return { ...delegated, modelValue: [modelValue] };
});

const forwarded = useForwardPropsEmits(delegatedProps, (event, arg) => {
  if (event === 'update:modelValue') {
    emits('update:modelValue', arg[0]);
  } else {
    emits(event as any, arg);
  }
});
</script>

<template>
  <SliderRoot
    :class="
      cn(
        'relative flex w-full touch-none select-none items-center',
        props.class,
      )
    "
    v-bind="forwarded"
  >
    <SliderTrack
      class="relative h-1 w-full grow overflow-hidden rounded-full bg-gray-400"
    >
      <SliderRange
        class="absolute h-full"
        bg="primary-400 data-[disabled]=primary-200"
      />
    </SliderTrack>
    <SliderThumb
      class="block h-4 w-4 hover:(w-5 h-5) rounded-full transition-colors data-[disabled]:pointer-events-none focus-visible:(outline-0 ring-3 ring-primary-600 ring-opacity-35)"
      bg="primary-600 data-[disabled]:primary-300"
    />
  </SliderRoot>
</template>
