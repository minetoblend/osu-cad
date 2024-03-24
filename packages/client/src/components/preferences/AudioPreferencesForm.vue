<script setup lang="ts">
import { AudioPreferences } from '@osucad/common';

const props = defineProps<{
  preferences: AudioPreferences;
}>();

const { masterVolume, hitsoundVolume, hitsoundPanning, uiVolume, musicVolume } =
  toRefs(props.preferences);
</script>

<template>
  <h3>Audio</h3>
  <FormField full-width label="Master Volume">
    <Slider v-model="masterVolume" :min="0" :max="100" label />
  </FormField>
  <FormField full-width label="Music Volume">
    <Slider v-model="musicVolume" :min="0" :max="100" label />
  </FormField>
  <FormField full-width label="Hitsound Volume">
    <Slider v-model="hitsoundVolume" :min="0" :max="100" label />
  </FormField>
  <FormField full-width label="UI Volume">
    <Slider v-model="uiVolume" :min="0" :max="100" label />
  </FormField>
  <FormField full-width label="Hitsound Panning">
    <Slider v-model="hitsoundPanning" :min="0" :max="200" label />
  </FormField>
</template>
