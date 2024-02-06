<script setup lang="ts">
import {GraphicsPreferences} from "@osucad/common";

defineProps<{
  preferences: GraphicsPreferences
}>()
</script>

<template>
  <h3>Graphics</h3>
  <FormField label="Renderer">
    <ButtonGroup>
      <Button :outline="preferences.renderer !== 'auto'"
              @click="preferences.renderer = 'auto'">
        Auto
      </Button>
      <Button :outline="preferences.renderer !== 'webgl'"
              @click="preferences.renderer = 'webgl'">
        WebGL
      </Button>
      <Button :outline="preferences.renderer !== 'webgpu'"
              @click="preferences.renderer = 'webgpu'">
        WebGPU
      </Button>
    </ButtonGroup>
  </FormField>
  <FormField label="Resolution">
    <QSlider v-model="preferences.resolution" :min="0" :max="1" :step="0.01"/>
  </FormField>
  <FormField label="Antialiasing">
    <Switch v-model="preferences.antialiasing"/>
  </FormField>
</template>