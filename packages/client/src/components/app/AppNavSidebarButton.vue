<script setup lang="ts">
import { RouteLocationRaw, useLink } from 'vue-router/auto';

const props = defineProps<{
  to: RouteLocationRaw;
  icon?: string;
  text?: string;
}>();

const { isActive, href, navigate } = useLink({
  to: props.to,
});
</script>

<template>
  <div
    class="m-1 rounded-1 cursor-pointer group whitespace-nowrap"
    :class="[
      isActive
        ? 'text-primary-600 bg-gray-300'
        : 'text-gray-800 bg-transparent',
    ]"
    v-wave
  >
    <a class="flex items-center gap-2 p-2" :href="href" @click="navigate">
      <slot>
        <div v-if="icon" :class="icon" />
        {{ text }}
      </slot>
    </a>
  </div>
</template>
