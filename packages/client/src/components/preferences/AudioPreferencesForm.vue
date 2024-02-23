<script setup lang="ts">
import { AudioPreferences } from '@osucad/common';

defineProps<{
  preferences: AudioPreferences;
}>();
</script>

<template>
  <h3>Audio</h3>
  <FormField full-width label="Master Volume">
    <QSlider v-model="preferences.masterVolume" :min="0" :max="100" label />
  </FormField>
  <FormField full-width label="Music Volume">
    <QSlider v-model="preferences.musicVolume" :min="0" :max="100" label />
  </FormField>
  <FormField full-width label="Hitsound Volume">
    <QSlider v-model="preferences.hitsoundVolume" :min="0" :max="100" label />
  </FormField>
  <FormField full-width label="UI Volume">
    <QSlider v-model="preferences.uiVolume" :min="0" :max="100" label />
  </FormField>
  <FormField full-width label="Hitsound Panning">
    <QSlider v-model="preferences.hitsoundPanning" :min="0" :max="200" label />
  </FormField>
</template>
