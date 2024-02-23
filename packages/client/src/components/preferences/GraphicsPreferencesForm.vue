<script setup lang="ts">
import { GraphicsPreferences } from '@osucad/common';

defineProps<{
  preferences: GraphicsPreferences;
}>();

const availableRenderers = [
  {
    name: 'WebGL',
    value: 'webgl' as 'webgl' | 'webgpu',
  },
] as const;
</script>

<template>
  <h3>Graphics</h3>
  <FormField v-if="availableRenderers.length > 1" label="Renderer">
    <ButtonGroup>
      <Button
        :outline="preferences.renderer !== 'auto'"
        @click="preferences.renderer = 'auto'"
      >
        Auto
      </Button>
      <Button
        v-for="renderer in availableRenderers"
        :key="renderer.value"
        :outline="preferences.renderer !== renderer.value"
        @click="preferences.renderer = renderer.value"
      >
        {{ renderer.name }}
      </Button>
    </ButtonGroup>
  </FormField>
  <FormField label="Resolution">
    <QSlider v-model="preferences.resolution" :min="0" :max="1" :step="0.01" />
  </FormField>
  <FormField label="Antialiasing">
    <Switch v-model="preferences.antialiasing" />
  </FormField>
  <FormField label="Show fps">
    <Switch v-model="preferences.showFps" />
  </FormField>
</template>
