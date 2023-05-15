<script setup lang="ts">
import cursorPng from '@/assets/icons/select.png'
import { useSharedCursors } from '@/composables/useSharedCursors';
import { Texture } from 'pixi.js';
import { useViewport } from './tools/composables/mouseEvents';
import CursorSprite from './CursorSprite.vue';

const {mousePos} = useViewport()!

const cursors = useSharedCursors('viewport', mousePos)

</script>

<template>
  <pixi-container event-mode="none">
    <CursorSprite v-for="cursor in cursors" :key="cursor[0]" :position="cursor[1]" :user="cursor[0]" />
  </pixi-container>
</template>
