<script setup lang="ts">
import LoadingIcon from '@/editor/components/LoadingIcon.vue';
import { animate, Easing } from '@/editor/drawables/animate.ts';
import type { EditorContext } from '@/editor/editorContext.ts';
import gsap, { Power3 } from 'gsap';
import { promiseTimeout } from '@vueuse/core';
import { Component } from 'vue';

const props = defineProps<{
  joinKey: string;
}>();

const editor = shallowRef<EditorContext>();
const loadProgress = ref(0);
const loadingOpacity = computed(() =>
  animate(loadProgress.value, 2, 2.5, 1, 0, Easing.inQuad),
);
const viewportInitialized = ref(false);

const BeatmapEditor = shallowRef<Component>();

const scope = getCurrentScope();

onMounted(async () => {
  const progress = ref(0);
  const stop = watch(
    progress,
    (progress) => {
      gsap.to(loadProgress, {
        value: progress * 0.85,
        duration: 0.75,
        ease: Power3.easeOut,
      });
    },
    { immediate: true },
  );

  const { createEditorClient } = await import('@/editor/editorClient.ts');

  BeatmapEditor.value = defineAsyncComponent(
    () => import('@/editor/components/BeatmapEditor.vue'),
  );

  const ctx = await scope!.run(() =>
    createEditorClient(props.joinKey, progress),
  );

  stop();
  const tween = gsap.getTweensOf(loadProgress)[0];
  if (tween && tween.isActive()) {
    await tween;
  }

  editor.value = ctx;

  await until(viewportInitialized).toBeTruthy();

  await promiseTimeout(100);

  requestAnimationFrame(() => {
    gsap.to(loadProgress, { value: 2.5, duration: 1 });
  });
});
</script>

<template>
  <BeatmapEditor
    v-if="BeatmapEditor && editor"
    @viewportInitialized="viewportInitialized = true"
  />

  <div
    v-if="loadProgress < 2.5"
    id="loading-icon"
    class="absolute inset-0 z-50 bg-gray-100 flex justify-center items-center"
    :style="{ opacity: loadingOpacity }"
  >
    <div>
      <LoadingIcon :progress="loadProgress" />
      <ProgressBar :value="loadProgress * 100" />
    </div>
  </div>
</template>
