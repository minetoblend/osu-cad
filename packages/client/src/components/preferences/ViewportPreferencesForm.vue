<script setup lang="ts">
import {ViewportPreferences} from "@osucad/common";
import Switch from "@/components/Switch.vue";

defineProps<{
  preferences: ViewportPreferences
}>()
</script>

<template>
  <h3>Viewport</h3>
  <FormField label="Playfield scale">
    <QSlider v-model="preferences.playfieldScale" :min="70" :max="100" label/>
  </FormField>
  <FormField full-width label="Snaking sliders">
    <Switch v-model="preferences.snakingSliders"/>
  </FormField>
  <FormField full-width label="Hit Animations">
    <Switch v-model="preferences.hitAnimations"/>
  </FormField>
  <FormField full-width label="Hit Markers" v-if="!preferences.hitAnimations">
    <Switch v-model="preferences.hitMarkers"/>
  </FormField>
  <FormField label="Background dim">
    <QSlider v-model="preferences.backgroundDim" :min="0" :max="100" label/>
  </FormField>
  <FormField label="Background blur">
    <QSlider v-model="preferences.backgroundBlur" :min="0" :max="35" label/>
  </FormField>
  <h4>Grid</h4>
  <FormField label="Enabled">
    <Switch v-model="preferences.grid.enabled"/>
  </FormField>
  <FormField label="Color">
    <QColor v-model="preferences.grid.color" no-footer no-header format-model="hex" flat bordered/>
  </FormField>
  <FormField label="Opacity">
    <QSlider v-model="preferences.grid.opacity" :min="0" :max="100" label/>
  </FormField>
  <h4>Snapping</h4>
  <FormField label="Objects">
    <Switch v-model="preferences.snapping.objects.enabled"/>
  </FormField>
  <FormField label="Blanket">
    <Switch v-model="preferences.snapping.blanket.enabled"/>
  </FormField>
  <FormField label="Visual Spacing">
    <Switch v-model="preferences.snapping.visualSpacing.enabled"/>
  </FormField>
</template>